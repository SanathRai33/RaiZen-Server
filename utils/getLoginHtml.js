const getLoginHtml = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Welcome back, ${name} 👋</h2>
    <p>You just logged into your <strong>RaiZen</strong> account.</p>
    <p>If this was you, no further action is needed.</p>
    <p>If it wasn’t you, please reset your password immediately.</p>
    <br />
    <p>Thanks,<br/>The RaiZen Team</p>
    <hr style="margin-top: 20px;" />
    <p style="font-size: 12px; color: gray;">This is an automated message. Do not reply to this email.</p>
    <p style="font-size: 12px; color: gray;">© ${new Date().getFullYear()} RaiZen. All rights reserved.</p>
  </div>
`;

module.exports = getLoginHtml;
