from flask import Flask, jsonify, request, render_template
import pymysql
import logging
import pandas as pd
import json
from datetime import datetime
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Root@123',
    'db': 'ims_throwhorse',
    'charset': 'utf8mb4',
    'port': 3306
}

def get_db_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        logger.info("Database connection successful")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/analytics/payment-trends', methods=['GET'])
def get_payment_trends():
    try:
        conn = get_db_connection()
        query = """
            SELECT 
                created_at as payment_date,
                bill_amount as amount,
                is_verified as status,
                DATE_ADD(created_at, INTERVAL installment_plan MONTH) as due_date,
                merchant,
                installment_plan
            FROM installment_applications
            ORDER BY created_at
        """
        
        # Read data into pandas DataFrame
        df = pd.read_sql(query, conn)
        
        # Convert dates to datetime
        df['payment_date'] = pd.to_datetime(df['payment_date'])
        df['due_date'] = pd.to_datetime(df['due_date'])
        
        # Calculate monthly statistics
        monthly_stats = df.groupby(df['payment_date'].dt.strftime('%Y-%m')).agg({
            'amount': ['count', 'sum', 'mean'],
            'installment_plan': 'mean'
        }).round(2)
        
        # Calculate verification status distribution
        verification_dist = {
            'verified': int(df['status'].sum()),
            'pending': int(len(df) - df['status'].sum())
        }
        
        # Calculate merchant distribution
        merchant_dist = df['merchant'].value_counts().to_dict()
        
        # Calculate installment plan distribution
        plan_dist = df['installment_plan'].value_counts().sort_index().to_dict()
        
        # Calculate average amount by merchant
        merchant_avg = df.groupby('merchant')['amount'].agg(['mean', 'count']).round(2).to_dict('index')
        
        return jsonify({
            'success': True,
            'data': {
                'monthly_statistics': json.loads(monthly_stats.to_json()),
                'verification_status': verification_dist,
                'merchant_distribution': merchant_dist,
                'installment_plans': plan_dist,
                'merchant_analytics': merchant_avg
            }
        })
        
    except Exception as e:
        logger.error(f"Error in payment trends: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['DEBUG'] = True

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Root@123',
    'db': 'IMS_throwhorse',
    'charset': 'utf8mb4',
    'port': 3306  # Default MySQL port
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

@app.route('/api/analytics/payment-trends', methods=['GET'])
def get_payment_trends():
    try:
        conn = get_db_connection()
        query = """
            SELECT 
                payment_date,
                amount,
                status,
                due_date
            FROM payments
            ORDER BY payment_date
        """
        df = pd.read_sql(query, conn)
        
        # Convert dates to datetime
        df['payment_date'] = pd.to_datetime(df['payment_date'])
        df['due_date'] = pd.to_datetime(df['due_date'])
        
        # Calculate days until due date
        df['days_until_due'] = (df['due_date'] - df['payment_date']).dt.days
        
        # Monthly payment trends
        monthly_trends = df.groupby(df['payment_date'].dt.strftime('%Y-%m'))[['amount']].agg({
            'amount': ['count', 'mean', 'sum']
        }).round(2)
        
        # Payment status distribution
        status_dist = df['status'].value_counts().to_dict()
        
        # On-time vs late payments
        df['is_late'] = df['days_until_due'] < 0
        punctuality = df['is_late'].value_counts().to_dict()
        
        trends_analysis = {
            'monthly_trends': json.loads(monthly_trends.to_json()),
            'status_distribution': status_dist,
            'payment_punctuality': punctuality
        }
        
        return jsonify({
            'success': True,
            'data': trends_analysis
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/analytics/predict-payment', methods=['POST'])
def predict_payment():
    try:
        conn = get_db_connection()
        
        # Get historical payment data
        query = """
            SELECT 
                amount,
                DATEDIFF(payment_date, due_date) as days_difference,
                MONTH(payment_date) as month,
                DAYOFWEEK(payment_date) as day_of_week
            FROM payments
            WHERE status = 'completed'
        """
        df = pd.read_sql(query, conn)
        
        # Prepare features for training
        X = df[['month', 'day_of_week', 'days_difference']]
        y = df['amount']
        
        # Split data and train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Get prediction input from request
        data = request.json
        input_data = pd.DataFrame({
            'month': [data.get('month')],
            'day_of_week': [data.get('day_of_week')],
            'days_difference': [data.get('days_until_due', 0)]
        })
        
        # Make prediction
        predicted_amount = model.predict(input_data)[0]
        
        return jsonify({
            'success': True,
            'predicted_amount': round(float(predicted_amount), 2)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    app.run(port=5000, debug=True)
