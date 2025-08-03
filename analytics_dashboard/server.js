const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');
const moment = require('moment');

const app = express();
const PORT = 3002;

// Database configuration for IMS_throwhorse
const dbConfig = {
    host: 'localhost',
    database: 'IMS_throwhorse',
    user: 'root',
    password: 'Root@123',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(express.json());

// AI Model Training Function
async function trainTimeSeriesModel(data) {
    const model = tf.sequential();
    
    model.add(tf.layers.lstm({
        units: 32,
        returnSequences: true,
        inputShape: [6, 1] // 6 months of data to predict next month
    }));
    
    model.add(tf.layers.lstm({
        units: 16,
        returnSequences: false
    }));
    
    model.add(tf.layers.dense({ units: 1 }));
    
    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
    });

    // Prepare data for training
    const xs = tf.tensor3d(data.slice(0, -1), [1, data.length - 1, 1]);
    const ys = tf.tensor2d(data.slice(1), [1, data.length - 1]);

    await model.fit(xs, ys, {
        epochs: 100,
        verbose: 0
    });

    return model;
}

// API Endpoints

// 1. Predict Next Season's Applications
app.get('/api/predict/next-season', async (req, res) => {
    try {
        // Get historical data from the last 12 months
        const [rows] = await pool.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as applications,
                AVG(bill_amount) as avg_amount,
                merchant,
                installment_plan
            FROM installment_applications
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m'), merchant, installment_plan
            ORDER BY month
        `);

        const merchants = [...new Set(rows.map(r => r.merchant))];
        const predictions = {};

        for (const merchant of merchants) {
            const merchantData = rows.filter(r => r.merchant === merchant);
            const monthlyData = merchantData.map(r => r.applications);
            
            // Train model for this merchant
            const model = await trainTimeSeriesModel(monthlyData);
            
            // Make prediction for next month
            const input = tf.tensor3d(monthlyData.slice(-6), [1, 6, 1]);
            const prediction = model.predict(input);
            const predictedValue = Math.round(prediction.dataSync()[0]);

            // Analyze patterns
            const seasonalPattern = {
                spring: merchantData.filter(d => [3,4,5].includes(moment(d.month).month() + 1)),
                summer: merchantData.filter(d => [6,7,8].includes(moment(d.month).month() + 1)),
                fall: merchantData.filter(d => [9,10,11].includes(moment(d.month).month() + 1)),
                winter: merchantData.filter(d => [12,1,2].includes(moment(d.month).month() + 1))
            };

            predictions[merchant] = {
                predicted_applications: predictedValue,
                seasonal_analysis: Object.entries(seasonalPattern).map(([season, data]) => ({
                    season,
                    avg_applications: data.length ? 
                        Math.round(data.reduce((acc, curr) => acc + curr.applications, 0) / data.length) : 0,
                    avg_amount: data.length ? 
                        Math.round(data.reduce((acc, curr) => acc + curr.avg_amount, 0) / data.length) : 0
                })),
                recommendations: generateRecommendations(predictedValue, seasonalPattern, merchantData)
            };
        }

        res.json(predictions);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Prediction failed' });
    }
});

// 2. Analyze Installment Plan Performance
app.get('/api/analyze/plans', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                merchant,
                installment_plan,
                COUNT(*) as total_applications,
                AVG(bill_amount) as avg_amount,
                DATE_FORMAT(created_at, '%Y-%m') as month
            FROM installment_applications
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY merchant, installment_plan, DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month
        `);

        const analysis = {};
        const merchants = [...new Set(rows.map(r => r.merchant))];

        for (const merchant of merchants) {
            const merchantData = rows.filter(r => r.merchant === merchant);
            const plans = [...new Set(merchantData.map(r => r.installment_plan))];
            
            analysis[merchant] = {
                plans: plans.map(plan => {
                    const planData = merchantData.filter(d => d.installment_plan === plan);
                    const monthlyTrend = planData.map(d => ({
                        month: d.month,
                        applications: d.total_applications,
                        avg_amount: d.avg_amount
                    }));

                    return {
                        plan,
                        total_applications: planData.reduce((acc, curr) => acc + curr.total_applications, 0),
                        avg_amount: Math.round(planData.reduce((acc, curr) => acc + curr.avg_amount, 0) / planData.length),
                        monthly_trend: monthlyTrend,
                        growth_rate: calculateGrowthRate(monthlyTrend)
                    };
                }),
                optimal_plans: generateOptimalPlanRecommendations(merchantData)
            };
        }

        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

// 3. Get Market Insights
app.get('/api/insights/market', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                merchant,
                installment_plan,
                bill_amount,
                DATE_FORMAT(created_at, '%Y-%m') as month
            FROM installment_applications
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            ORDER BY created_at
        `);

        // Market size and growth
        const monthlyTotals = {};
        rows.forEach(row => {
            if (!monthlyTotals[row.month]) {
                monthlyTotals[row.month] = {
                    total_amount: 0,
                    applications: 0
                };
            }
            monthlyTotals[row.month].total_amount += row.bill_amount;
            monthlyTotals[row.month].applications += 1;
        });

        // Market share analysis
        const merchantShares = {};
        rows.forEach(row => {
            if (!merchantShares[row.merchant]) {
                merchantShares[row.merchant] = {
                    total_amount: 0,
                    applications: 0
                };
            }
            merchantShares[row.merchant].total_amount += row.bill_amount;
            merchantShares[row.merchant].applications += 1;
        });

        // Calculate market share percentages
        const totalMarket = Object.values(merchantShares).reduce((acc, curr) => acc + curr.total_amount, 0);
        Object.keys(merchantShares).forEach(merchant => {
            merchantShares[merchant].market_share = (merchantShares[merchant].total_amount / totalMarket * 100).toFixed(2);
        });

        const insights = {
            market_growth: calculateMarketGrowth(monthlyTotals),
            market_shares: merchantShares,
            trending_plans: analyzeTrendingPlans(rows),
            recommendations: generateMarketRecommendations(rows)
        };

        res.json(insights);
    } catch (error) {
        console.error('Market insights error:', error);
        res.status(500).json({ error: 'Failed to generate market insights' });
    }
});

// Helper Functions
function generateRecommendations(predictedValue, seasonalPattern, historicalData) {
    const recommendations = [];
    const currentMonth = moment().month() + 1;
    const nextSeason = getNextSeason(currentMonth);
    
    const seasonalData = seasonalPattern[nextSeason];
    const historicalAvg = seasonalData.length ? 
        Math.round(seasonalData.reduce((acc, curr) => acc + curr.applications, 0) / seasonalData.length) : 0;

    if (predictedValue > historicalAvg * 1.2) {
        recommendations.push(`Expected growth: Prepare for ${Math.round((predictedValue/historicalAvg - 1) * 100)}% increase`);
    }

    const popularPlans = [...new Set(historicalData.map(d => d.installment_plan))]
        .sort((a, b) => {
            const aTotal = historicalData.filter(d => d.installment_plan === a)
                .reduce((acc, curr) => acc + curr.applications, 0);
            const bTotal = historicalData.filter(d => d.installment_plan === b)
                .reduce((acc, curr) => acc + curr.applications, 0);
            return bTotal - aTotal;
        });

    recommendations.push(`Focus on ${popularPlans.slice(0, 2).join(' and ')}-month plans`);
    return recommendations;
}

function calculateGrowthRate(monthlyTrend) {
    if (monthlyTrend.length < 2) return 0;
    
    const first = monthlyTrend[0].applications;
    const last = monthlyTrend[monthlyTrend.length - 1].applications;
    return ((last - first) / first * 100).toFixed(2);
}

function generateOptimalPlanRecommendations(merchantData) {
    const plans = [...new Set(merchantData.map(d => d.installment_plan))];
    const planMetrics = plans.map(plan => {
        const planData = merchantData.filter(d => d.installment_plan === plan);
        return {
            plan,
            total_value: planData.reduce((acc, curr) => acc + (curr.avg_amount * curr.total_applications), 0),
            growth_rate: calculateGrowthRate(planData)
        };
    });

    return planMetrics
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 3)
        .map(p => ({
            plan: p.plan,
            recommendation: `${p.plan}-month plan shows ${p.growth_rate}% growth potential`
        }));
}

function getNextSeason(currentMonth) {
    if (currentMonth <= 2) return 'spring';
    if (currentMonth <= 5) return 'summer';
    if (currentMonth <= 8) return 'fall';
    return 'winter';
}

function calculateMarketGrowth(monthlyTotals) {
    const months = Object.keys(monthlyTotals).sort();
    if (months.length < 2) return 0;

    const firstMonth = monthlyTotals[months[0]];
    const lastMonth = monthlyTotals[months[months.length - 1]];

    return {
        applications_growth: ((lastMonth.applications - firstMonth.applications) / firstMonth.applications * 100).toFixed(2),
        amount_growth: ((lastMonth.total_amount - firstMonth.total_amount) / firstMonth.total_amount * 100).toFixed(2)
    };
}

function analyzeTrendingPlans(data) {
    const planTrends = {};
    data.forEach(row => {
        if (!planTrends[row.installment_plan]) {
            planTrends[row.installment_plan] = {
                total_applications: 0,
                total_amount: 0
            };
        }
        planTrends[row.installment_plan].total_applications++;
        planTrends[row.installment_plan].total_amount += row.bill_amount;
    });

    return Object.entries(planTrends)
        .map(([plan, data]) => ({
            plan: parseInt(plan),
            ...data,
            average_amount: data.total_amount / data.total_applications
        }))
        .sort((a, b) => b.total_applications - a.total_applications);
}

function generateMarketRecommendations(data) {
    const recommendations = [];
    const trendingPlans = analyzeTrendingPlans(data);
    
    recommendations.push(`Most popular plan: ${trendingPlans[0].plan} months`);
    recommendations.push(`Highest average value: ${trendingPlans.sort((a, b) => b.average_amount - a.average_amount)[0].plan} months`);
    
    return recommendations;
}

app.listen(PORT, () => {
    console.log(`AI Analytics Service running on http://localhost:${PORT}`);
});
