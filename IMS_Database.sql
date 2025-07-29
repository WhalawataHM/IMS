CREATE DATABASE IMS_throwhorse;
USE IMS_throwhorse;

-- ------------------------customer_data table---------------------------------------
CREATE TABLE customer_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_number VARCHAR(16) NOT NULL,
    nic VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------installment_applications table---------------------------------------
CREATE TABLE installment_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_number VARCHAR(16) NOT NULL,
    nic VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    merchant VARCHAR(100) NOT NULL,
    installment_plan INT NOT NULL,
    bill_amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE installment_applications 
ADD COLUMN transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ------------------------login_data_table---------------------------------------
CREATE TABLE login_credentials (
	id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_access ENUM('reader','editor','admin') NOT NULL
);

drop table login_credentials;


INSERT INTO login_credentials (user_id, password, role_access) VALUES ('admin','Admin_123','admin');
INSERT INTO login_credentials (user_id, password, role_access) VALUES ('editor','Editor_123','editor');
INSERT INTO login_credentials (user_id, password, role_access) VALUES ('reader','Reader_123','reader');

-- -----------------------------Insert sample data into the 'customrt_data' table---------------------------------------
INSERT INTO customer_data (card_number, nic, full_name, contact_number, email) VALUES
  ('4789123456789012', '901234567V', 'Alice Smith', 0771234567, 'alice.s@example.com') ,
  ('5123456789012345', '856789012V', 'Bob Johnson', 0712345678, 'bob.j@example.com') ,
  ('4321098765432109', '789012345V', 'Carol White', '0765432109', 'carol.w@example.com') ,
  ('5987654321098765', '923456789V', 'David Brown', '0759876543', 'david.b@example.com') ,
  ('4012345678901234', '889012345V', 'Emily Davis', '0780123456', 'emily.d@example.com') ,
  ('5678901234567890', '912345678V', 'Frank Green', '0706789012', 'frank.g@example.com') ,
  ('4543210987654321', '867890123V', 'Grace Hall', '0725432109', 'grace.h@example.com') ,
  ('5098765432109876', '790123456V', 'Henry King', '0770987654', 'henry.k@example.com') ,
  ('4123456789012340', '934567890V', 'Ivy Lee', '0711234567', 'ivy.l@example.com') ,
  ('5876543210987650', '890123456V', 'Jack Taylor', '0768765432', 'jack.t@example.com') ,
  ('4901234567890123', '901234567V', 'Karen Wilson', '0779012345', 'karen.w@example.com') ,
  ('5234567890123456', '856789012V', 'Leo Moore', '0712345678', 'leo.m@example.com') ,
  ('4456789012345678', '789012345V', 'Mia Clark', '0764567890', 'mia.c@example.com') ,
  ('5789012345678901', '923456789V', 'Noah Lewis', '0757890123', 'noah.l@example.com') ,
  ('4000111222333444', '889012345V', 'Olivia Scott', '0780001112', 'olivia.s@example.com') ,
  ('5555666777888999', '912345678V', 'Peter Adams', '0705556667', 'peter.a@example.com') ,
  ('4101203040506070', '867890123V', 'Quinn Baker', '0721012030', 'quinn.b@example.com') ,
  ('5212324353637383', '790123456V', 'Rachel Wright', '0772123243', 'rachel.w@example.com') ,
  ('4333444555666777', '934567890V', 'Sam Hill', '0713334445', 'sam.h@example.com') ,
  ('5888999000111222', '890123456V', 'Tina Green', '0768889990', 'tina.g@example.com') ,
  ('4121314151617181', '901234567V', 'Uma Khan', '0771213141', 'uma.k@example.com') ,
  ('5232425262728292', '856789012V', 'Victor Singh', '0712324252', 'victor.s@example.com') ,
  ('4343536373839303', '789012345V', 'Wendy Chen', '0763435363', 'wendy.c@example.com') ,
  ('5454647484940414', '923456789V', 'Xavier Roy', '0754546474', 'xavier.r@example.com') ,
  ('4565758595051525', '889012345V', 'Yara Ali', '0785657585', 'yara.a@example.com') ,
  ('5676869707172737', '912345678V', 'Zane Khan', '0706768697', 'zane.k@example.com') ,
  ('4787980818283848', '867890123V', 'Amy Lee', '0727879808', 'amy.l@example.com') ,
  ('5898091929394959', '790123456V', 'Ben Carter', '0778980919', 'ben.c@example.com') ,
  ('4909192939495969', '934567890V', 'Chloe King', '0719091929', 'chloe.k@example.com') ,
  ('5010203040506070', '890123456V', 'Daniel Hall', '0760102030', 'daniel.h@example.com') ,
  ('4111213141516171', '901234567V', 'Ella Brown', '0771112131', 'ella.b@example.com') ,
  ('5222324252627282', '856789012V', 'Finn White', '0712223242', 'finn.w@example.com') ,
  ('4333435363738393', '789012345V', 'Gina Smith', '0763334353', 'gina.s@example.com') ,
  ('5444546474849404', '923456789V', 'Hugo Johnson', '0754445464', 'hugo.j@example.com') ,
  ('4555657585950515', '889012345V', 'Iris Davis', '0785556575', 'iris.d@example.com') ,
  ('5666768696061626', '912345678V', 'Jake Green', '0706667686', 'jake.g@example.com') ,
  ('4777879808182838', '867890123V', 'Kelly Hall', '0727778798', 'kelly.h@example.com') ,
  ('5888980919293949', '790123456V', 'Liam King', '0778889809', 'liam.k@example.com') ,
  ('4999091929394959', '934567890V', 'Maya Lee', '0719990919', 'maya.l@example.com') ,
  ('5000102030405060', '890123456V', 'Nora Taylor', '0760001020', 'nora.t@example.com') ,
  ('4101112131415161', '901234567V', 'Oscar Wilson', '0771011121', 'oscar.w@example.com') ,
  ('5202324252627282', '856789012V', 'Penny Moore', '0712023242', 'penny.m@example.com') ,
  ('4303435363738393', '789012345V', 'Rhys Clark', '0763034353', 'rhys.c@example.com') ,
  ('5404546474849404', '923456789V', 'Sara Lewis', '0754045464', 'sara.l@example.com') ,
  ('4505657585950515', '889012345V', 'Tom Scott', '0785056575', 'tom.s@example.com') ,
  ('5606768696061626', '912345678V', 'Una Adams', '0706067686', 'una.a@example.com') ,
  ('4707879808182838', '867890123V', 'Vivi Baker', '0727078798', 'vivi.b@example.com') ,
  ('5808980919293949', '790123456V', 'Will Wright', '0778089809', 'will.w@example.com') ,
  ('4909192939495969', '934567890V', 'Xena Hill', '0719091929', 'xena.h@example.com') ,
  ('5000102030405060', '890123456V', 'Yuki Green', '0760001020', 'yuki.g@example.com');