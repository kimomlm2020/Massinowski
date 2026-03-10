import nodemailer from '../config/email.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      const { default: createTransporter } = await import('../config/email.js');
      this.transporter = await createTransporter();
      this.initialized = true;
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      await this.init();
      
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Massinowski" <noreply@massinowski.com>',
        to,
        subject,
        html,
        text: text || 'Please view this email in HTML format.'
      });

      console.log('✅ Email sent to:', to);
      console.log('   Subject:', subject);
      
      if (this.transporter.testAccount && info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('📧 Preview URL:', previewUrl);
        return { success: true, previewUrl, messageId: info.messageId };
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ==================== CLIENT EMAILS ====================

  async sendBankTransferInstructionsToClient(order) {
    const bankDetails = {
      holder: process.env.BANK_HOLDER || 'MASSINOWSKI SARL',
      iban: process.env.BANK_IBAN || 'FR76 3000 4000 5000 6000 7000 800',
      bic: process.env.BANK_BIC || 'BNPAFRPPXXX',
      bankName: process.env.BANK_NAME || 'Crédit Agricole',
      bankAddress: process.env.BANK_ADDRESS || '12 Rue de la Paix, 75000 Paris'
    };

    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #333;">
          ${item.icon || '📋'} ${item.name}
        </td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:right;">
          ${item.price}€
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{margin:0;padding:0;background:#000;font-family:Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#000;color:#fff;}
          .header{background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);padding:40px;text-align:center;border-bottom:3px solid #D4AF37;}
          .gold{color:#D4AF37;}
          .content{padding:30px;}
          .box{background:#0a0a0a;border:2px solid #D4AF37;padding:25px;margin:20px 0;border-radius:8px;}
          .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #333;}
          .label{color:#D4AF37;font-weight:bold;}
          .warning{background:#1a0a0a;border-left:4px solid #ff6b6b;padding:20px;margin:20px 0;}
          table{width:100%;border-collapse:collapse;margin:20px 0;}
          th{background:#D4AF37;color:#000;padding:12px;text-align:left;}
          .ref{background:#D4AF37;color:#000;padding:10px 20px;font-family:monospace;font-size:18px;font-weight:bold;text-align:center;margin:15px 0;border-radius:5px;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="gold" style="margin:0;font-size:28px;letter-spacing:3px;">MASSINOWSKI</h1>
            <p style="color:#888;letter-spacing:2px;">INSTRUCTIONS DE PAIEMENT</p>
          </div>
          
          <div class="content">
            <p style="font-size:16px;">Bonjour <strong class="gold">${order.address.firstName} ${order.address.lastName}</strong>,</p>
            
            <p>Merci pour votre commande. Pour la finaliser, veuillez effectuer un virement bancaire :</p>
            
            <div class="box">
              <h3 class="gold" style="margin-top:0;">🏦 COORDONNÉES BANCAIRES</h3>
              <div class="row"><span class="label">Titulaire</span><span>${bankDetails.holder}</span></div>
              <div class="row"><span class="label">IBAN</span><span style="font-family:monospace;">${bankDetails.iban}</span></div>
              <div class="row"><span class="label">BIC/SWIFT</span><span style="font-family:monospace;">${bankDetails.bic}</span></div>
              <div class="row"><span class="label">Banque</span><span>${bankDetails.bankName}</span></div>
            </div>

            <div class="box" style="border-color:#ff6b6b;background:#1a0a0a;">
              <h3 class="gold">💰 DÉTAILS DU VIREMENT</h3>
              <div class="row">
                <span class="label">Montant</span>
                <span style="font-size:24px;color:#D4AF37;font-weight:bold;">${order.amount.toFixed(2)} €</span>
              </div>
              <p style="color:#ff6b6b;text-align:center;margin:15px 0;">⚠️ RÉFÉRENCE OBLIGATOIRE</p>
              <div class="ref">${order.bankTransferReference}</div>
              <p style="font-size:12px;color:#888;text-align:center;">À mentionner impérativement dans le libellé</p>
            </div>

            <div class="warning">
              <p style="margin:0;"><strong class="gold">Important :</strong> Sans cette référence, nous ne pourrons pas identifier votre paiement. Votre commande est réservée pendant 7 jours.</p>
            </div>

            <h3 class="gold">📋 RÉCAPITULATIF</h3>
            <table>
              <thead><tr><th>Programme</th><th style="text-align:right;">Prix</th></tr></thead>
              <tbody style="background:#0a0a0a;">
                ${itemsList}
                <tr style="background:#1a1a1a;font-weight:bold;">
                  <td style="padding:15px;border-top:2px solid #D4AF37;">TOTAL</td>
                  <td style="padding:15px;border-top:2px solid #D4AF37;text-align:right;color:#D4AF37;font-size:18px;">
                    ${order.amount.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>

            <p style="text-align:center;color:#888;font-size:13px;">
              Questions ? Contactez <a href="mailto:${process.env.SUPPORT_EMAIL || 'contact@massinowski.com'}" style="color:#D4AF37;">${process.env.SUPPORT_EMAIL || 'contact@massinowski.com'}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address.email,
      subject: `🏦 [ACTION REQUISE] Virement bancaire - Commande ${order.bankTransferReference}`,
      html
    });
  }

  async sendCODConfirmationToClient(order) {
    const itemsList = order.items.map(item => `
      <li style="margin:10px 0;color:#ccc;">
        ${item.icon || '📋'} <strong style="color:#fff;">${item.name}</strong> - ${item.price}€
      </li>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{margin:0;padding:0;background:#000;font-family:Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#000;color:#fff;}
          .header{background:linear-gradient(135deg,#1a1a1a,#000);padding:40px;text-align:center;border-bottom:3px solid #D4AF37;}
          .gold{color:#D4AF37;}
          .content{padding:30px;}
          .box{background:#0a0a0a;border:1px solid #333;padding:25px;margin:20px 0;border-radius:8px;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="gold">✅ Commande Confirmée</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong class="gold">${order.address.firstName}</strong>,</p>
            <p>Votre commande en <strong>paiement à la livraison</strong> est confirmée.</p>
            
            <div class="box">
              <h3 class="gold">📦 Détails</h3>
              <p><strong>Numéro :</strong> ${order._id}</p>
              <p><strong>Montant :</strong> <span style="color:#D4AF37;font-size:22px;font-weight:bold;">${order.amount.toFixed(2)} €</span></p>
              <ul style="list-style:none;padding:0;">${itemsList}</ul>
            </div>

            <div class="box" style="border-color:#D4AF37;">
              <h3 class="gold">💵 Paiement à la livraison</h3>
              <p>Veuillez préparer <strong style="color:#D4AF37;">${order.amount.toFixed(2)} €</strong> en espèces ou carte.</p>
              <p style="color:#888;font-size:14px;">Notre livreur vous appellera au <strong>${order.address.phone}</strong> 24h avant la livraison.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address.email,
      subject: `✅ Commande confirmée - Paiement à la livraison #${order._id.toString().slice(-6)}`,
      html
    });
  }

  async sendPaymentConfirmationToClient(order) {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #333;">${item.icon || '📋'} ${item.name}</td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:right;">${item.price}€</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{margin:0;padding:0;background:#000;font-family:Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#000;color:#fff;}
          .header{background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);padding:40px;text-align:center;border-bottom:3px solid #D4AF37;}
          .gold{color:#D4AF37;}
          .content{padding:30px;}
          .box{background:#0a0a0a;border:2px solid #D4AF37;padding:25px;margin:20px 0;border-radius:8px;text-align:center;}
          .success-icon{font-size:48px;margin-bottom:15px;}
          table{width:100%;border-collapse:collapse;margin:20px 0;}
          th{background:#D4AF37;color:#000;padding:12px;text-align:left;}
          .btn{background:#D4AF37;color:#000;padding:15px 30px;text-decoration:none;display:inline-block;border-radius:5px;font-weight:bold;margin:20px 0;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="gold" style="margin:0;font-size:28px;letter-spacing:3px;">MASSINOWSKI</h1>
            <p style="color:#888;letter-spacing:2px;">CONFIRMATION DE PAIEMENT</p>
          </div>
          
          <div class="content">
            <div class="box">
              <div class="success-icon">✅</div>
              <h2 class="gold" style="margin:0 0 10px 0;">Paiement confirmé !</h2>
              <p style="color:#888;margin:0;">Votre commande a été traitée avec succès</p>
            </div>

            <p style="font-size:16px;">Bonjour <strong class="gold">${order.address.firstName}</strong>,</p>
            
            <p>Nous avons bien reçu votre paiement de <strong style="color:#D4AF37;font-size:20px;">${order.amount.toFixed(2)} €</strong>.</p>
            
            <p style="background:#0a0a0a;padding:15px;border-left:3px solid #D4AF37;">
              <strong>Méthode :</strong> ${order.getPaymentMethodLabel ? order.getPaymentMethodLabel() : order.paymentMethod}<br>
              <strong>Date :</strong> ${new Date(order.paymentDate || Date.now()).toLocaleString('fr-FR')}<br>
              <strong>Référence :</strong> ${order.paymentId || order._id}
            </p>

            <h3 class="gold">📋 Votre commande</h3>
            <table>
              <thead><tr><th>Programme</th><th style="text-align:right;">Prix</th></tr></thead>
              <tbody style="background:#0a0a0a;">
                ${itemsList}
                <tr style="background:#1a1a1a;font-weight:bold;">
                  <td style="padding:15px;border-top:2px solid #D4AF37;">TOTAL</td>
                  <td style="padding:15px;border-top:2px solid #D4AF37;text-align:right;color:#D4AF37;font-size:18px;">
                    ${order.amount.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="text-align:center;margin-top:30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="btn">
                Accéder à mes programmes
              </a>
            </div>

            <p style="text-align:center;color:#888;font-size:13px;margin-top:30px;">
              Merci pour votre confiance.<br>
              L'équipe <strong class="gold">Massinowski</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address.email,
      subject: `✅ Paiement confirmé - Commande #${order._id.toString().slice(-6)}`,
      html
    });
  }

  // ==================== ADMIN EMAILS ====================

  async sendBankTransferNotificationToAdmin(order) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@massinowski.com';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;}
          .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);}
          .header{background:#D4AF37;color:#000;padding:20px;text-align:center;}
          .content{padding:30px;}
          .alert{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:15px 0;}
          .info-box{background:#f8f9fa;border-radius:6px;padding:20px;margin:15px 0;}
          table{width:100%;border-collapse:collapse;margin:15px 0;}
          td{padding:10px;border-bottom:1px solid #dee2e6;}
          .btn{background:#D4AF37;color:#000;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;margin:10px 5px;}
          .reference{background:#000;color:#D4AF37;padding:10px 15px;font-family:monospace;font-size:16px;border-radius:5px;display:inline-block;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;">🏦 Nouvelle commande - Virement bancaire</h2>
          </div>
          <div class="content">
            <div class="alert">
              <strong>⚠️ Action requise :</strong> Cette commande attend un virement bancaire.
            </div>
            
            <div class="info-box">
              <h3 style="margin-top:0;color:#D4AF37;">Référence de virement</h3>
              <div class="reference">${order.bankTransferReference}</div>
              <p style="margin:10px 0 0 0;color:#666;font-size:14px;">Vérifier cette référence sur votre relevé bancaire</p>
            </div>

            <h3>📋 Détails de la commande</h3>
            <table>
              <tr><td><strong>ID</strong></td><td>${order._id}</td></tr>
              <tr><td><strong>Date</strong></td><td>${new Date(order.createdAt).toLocaleString('fr-FR')}</td></tr>
              <tr><td><strong>Montant</strong></td><td style="color:#D4AF37;font-weight:bold;font-size:18px;">${order.amount.toFixed(2)} €</td></tr>
              <tr><td><strong>Statut</strong></td><td><span style="background:#ffc107;padding:5px 10px;border-radius:3px;">En attente de virement</span></td></tr>
            </table>

            <h3>👤 Informations client</h3>
            <table>
              <tr><td><strong>Nom</strong></td><td>${order.address.firstName} ${order.address.lastName}</td></tr>
              <tr><td><strong>Email</strong></td><td><a href="mailto:${order.address.email}">${order.address.email}</a></td></tr>
              <tr><td><strong>Téléphone</strong></td><td>${order.address.phone}</td></tr>
              <tr><td><strong>Adresse</strong></td><td>
                ${order.address.street}${order.address.apartment ? ', ' + order.address.apartment : ''}<br>
                ${order.address.zipcode} ${order.address.city}<br>
                ${order.address.country}
              </td></tr>
            </table>

            <h3>🛒 Programmes commandés</h3>
            <table>
              ${order.items.map(item => `
                <tr>
                  <td>${item.icon || '📋'} ${item.name}</td>
                  <td style="text-align:right;">${item.price}€</td>
                </tr>
              `).join('')}
              <tr style="background:#f8f9fa;font-weight:bold;">
                <td>TOTAL</td>
                <td style="text-align:right;color:#D4AF37;">${order.amount.toFixed(2)}€</td>
              </tr>
            </table>

            <div style="text-align:center;margin-top:30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/orders/${order._id}" class="btn">
                Voir la commande
              </a>
              <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/admin/bank-transfers" class="btn" style="background:#000;color:#D4AF37;border:2px solid #D4AF37;">
                Voir les virements
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `🔔 [ACTION] Virement en attente - ${order.bankTransferReference} - ${order.amount.toFixed(2)}€`,
      html
    });
  }

  async sendCODNotificationToAdmin(order) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@massinowski.com';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;}
          .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);}
          .header{background:#4CAF50;color:#fff;padding:20px;text-align:center;}
          .content{padding:30px;}
          .info-box{background:#f8f9fa;border-radius:6px;padding:20px;margin:15px 0;}
          table{width:100%;border-collapse:collapse;margin:15px 0;}
          td{padding:10px;border-bottom:1px solid #dee2e6;}
          .btn{background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;">📦 Nouvelle commande - Paiement à la livraison</h2>
          </div>
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top:0;color:#4CAF50;">💵 Paiement à la livraison</h3>
              <p>Le client paiera <strong>${order.amount.toFixed(2)} €</strong> à la réception.</p>
            </div>

            <h3>📋 Détails</h3>
            <table>
              <tr><td><strong>ID</strong></td><td>${order._id}</td></tr>
              <tr><td><strong>Date</strong></td><td>${new Date(order.createdAt).toLocaleString('fr-FR')}</td></tr>
              <tr><td><strong>Montant à percevoir</strong></td><td style="color:#4CAF50;font-weight:bold;font-size:18px;">${order.amount.toFixed(2)} €</td></tr>
            </table>

            <h3>👤 Client</h3>
            <table>
              <tr><td><strong>Nom</strong></td><td>${order.address.firstName} ${order.address.lastName}</td></tr>
              <tr><td><strong>Email</strong></td><td>${order.address.email}</td></tr>
              <tr><td><strong>Téléphone</strong></td><td style="background:#fff3cd;padding:10px;"><strong>${order.address.phone}</strong></td></tr>
              <tr><td><strong>Adresse</strong></td><td>
                ${order.address.street}${order.address.apartment ? ', ' + order.address.apartment : ''}<br>
                ${order.address.zipcode} ${order.address.city}<br>
                ${order.address.country}
              </td></tr>
            </table>

            <h3>🛒 Articles</h3>
            <table>
              ${order.items.map(item => `
                <tr>
                  <td>${item.icon || '📋'} ${item.name}</td>
                  <td style="text-align:right;">${item.price}€</td>
                </tr>
              `).join('')}
              <tr style="background:#f8f9fa;font-weight:bold;">
                <td>TOTAL</td>
                <td style="text-align:right;color:#4CAF50;">${order.amount.toFixed(2)}€</td>
              </tr>
            </table>

            <div style="text-align:center;margin-top:30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/orders/${order._id}" class="btn">
                Gérer la commande
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `📦 Nouveau COD - ${order.amount.toFixed(2)}€ - ${order.address.firstName} ${order.address.lastName}`,
      html
    });
  }

  async sendPaymentValidatedToClient(order) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{margin:0;padding:0;background:#000;font-family:Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;text-align:center;}
          .gold{color:#D4AF37;}
          .box{background:#0a0a0a;border:2px solid #D4AF37;padding:30px;margin:20px 0;border-radius:8px;}
          .btn{background:#D4AF37;color:#000;padding:15px 30px;text-decoration:none;display:inline-block;border-radius:5px;font-weight:bold;margin-top:20px;}
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="gold" style="font-size:36px;margin-bottom:20px;">💰 Paiement validé</h1>
          <div class="box">
            <p style="font-size:18px;">Votre virement a été reçu et validé.</p>
            <p style="font-size:28px;color:#D4AF37;font-weight:bold;margin:15px 0;">
              ${order.amount.toFixed(2)} €
            </p>
            <p style="color:#888;">Commande : ${order._id}</p>
          </div>
          <p style="font-size:16px;line-height:1.6;">
            Votre programme est maintenant <strong class="gold">actif</strong> !<br>
            Vous pouvez commencer immédiatement.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="btn">
            Accéder à mes programmes
          </a>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address.email,
      subject: `✅ Paiement validé - Votre programme est actif !`,
      html
    });
  }
}

export default new EmailService();