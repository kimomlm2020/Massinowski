import nodemailer from 'nodemailer';

const createTransporter = async () => {
  // Mode développement : Ethereal (test)
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_PASS) {
    console.log('📧 Using Ethereal Email for testing...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Test account:', testAccount.user);
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    transporter.testAccount = testAccount;
    return transporter;
  }

  // Production : Hostinger SMTP
  console.log('📧 Using Hostinger SMTP:', process.env.SMTP_HOST);
  console.log('📧 SMTP User:', process.env.SMTP_USER);
  console.log('📧 SMTP Port:', process.env.SMTP_PORT || 465);
  
  // Vérification des variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing SMTP credentials!');
    throw new Error('SMTP_USER or SMTP_PASS not defined');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // Hostinger utilise SSL sur le port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    debug: true, // Debug mode
    logger: true  // Logger
  });
};

export default createTransporter;