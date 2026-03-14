const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { company, name, email, message } = req.body;

  // 必須項目のバリデーション
  if (!name || !email || !message) {
    return res.status(400).json({ message: '必要な項目が入力されていません。' });
  }

  // SMTPトランスポーターの作成（環境変数を使用）
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // 管理者（固定アドレス）へ送るメールの定義
    const mailOptions = {
      from: `"C.R.M. Corporate Site" <${process.env.SMTP_USER}>`, // 送信元（認証情報のアドレス）
      to: 'c.r.m8.4contact@info-crm.com', // ユーザー指定の受信先アドレス
      subject: 'HPからのお問い合わせ', // ユーザー要望の固定件名
      text: `
ウェブサイトのお問い合わせフォームから新しいメッセージが届きました。

【会社名】 ${company || '未入力'}
【氏名】 ${name}
【メールアドレス】 ${email}

【お問い合わせ内容】
${message}
      `,
    };

    // メールの送信実行
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'お問い合わせを送信しました。' });
  } catch (error) {
    console.error('Email Send Error:', error);
    res.status(500).json({ success: false, message: 'メールの送信に失敗しました。後ほどやり直してください。', error: error.message });
  }
}
