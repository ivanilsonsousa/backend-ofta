const db = require('../database/database');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcript = require('bcrypt');

const authConfig = require('../config/auth.json');

function makeCode(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const messageEmail = (name, code) => `
  <h1>Team Scorpion Dev</h1>
  <h4>Se você solicitou uma redefinição de senha para ${name}, use o código de confirmação abaixo para concluir o processo. Se você não fez essa solicitação, ignore este e-mail.</h4>
  <strong>${code}</strong>
  <br/><br/>
  <i>IMPORTANTE</i> O código que consta neste e-mail tem validade de 30 min.
`;

module.exports = {
  async auth(req, res) {
    let { user, password } = req.body;
    let pass = false;

    if (user)
      user = user.toLowerCase();

    const [login] = await db.where({ user }).select(['id', 'user', 'password']).table('user');

    if (login)
      pass = await bcript.compare(password, login.password);

    if (login === null || login === undefined || !pass)
      return res.json({ message: "Usuário e/ou senha incorretos ou usuário inativo", type: "warning", code: 400 });

    delete (login.password);

    const token = jwt.sign({ id: login.id }, authConfig.secret, {
      expiresIn: 86400,
    });

    return res.json({ login, token });
  },
  async isAuthenticate(req, res) {
    return res.json({ status: "ok" });
  },
  async beginPassReset(req, res) {
    const { email } = req.body;
    console.log(email);
    const [user] = await db.where({ email }).select().table('user');

    if (!user)
      return res.json({ msg: "E-mail não cadastrado na base de dados", code: 401, type: "warning" });

    // return res.json({ msg: "Te enviamos um e-mail para a recuperação de sua senha", email: user.email, code: 200, type: "success" });

    const code = makeCode(8);

    db.insert({ code, user_id: user.id, timestamp: Date.now() + 86400 }).table('reset_password_user')
      .then((result) => {
        console.log("Dados inseridos com suceso!");
      });

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });

    let mailOptions = {
      from: `${process.env.TITLE_EMAIL} <${process.env.EMAIL}>`,
      to: user.email,
      subject: 'Recuperação de senha',
      html: messageEmail(user.name, code)
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("::: Status: Erro ao enviar o e-mail!!!");
        console.log(err);

        return res.json({ msg: "Erro ao enviar o e-mail", error: err, code: 500, type: "error" });
      } else {
        console.log("::: Status: Email enviado com sucesso!!!");

        return res.json({ msg: "Te enviamos um e-mail para a recuperação de sua senha", error: err, email: user.email, code: 200, type: "success" });
      }
    });

  },
  async confirmPinReset(req, res) {
    const { email, code } = req.body;

    const [regs] = await db.where({ email })
      .select()
      .table('user')
      .innerJoin("reset_password_user", "reset_password_user.user_id", "user.id")
      .orderBy("reset_password_user.id", "desc");

    if (regs.code !== code)
      return res.json({ msg: "Código informado não é válido", code: 401, type: "error" });

    console.log(regs.timestamp, Date.now());
    if (parseInt(Date.now()) > parseFloat(regs.timestamp))
      return res.json({ msg: "Código informado expirou", code: 401, type: "error" });

    return res.json({ msg: "Código informado confirmado", code: 200 });
  },
  async resetPass(req, res) {
    const { pass, passConfirm, email } = req.body;

    if (pass !== passConfirm)
      return res.json({ msg: "Senhas não combinam", code: 401, type: "error" });


    const newPass = await bcript.hash(pass, 10);

    await db.where({ email }).update({ password: newPass }).table('user');


    return res.json({ msg: "Senha alterada com sucessso", code: 200 });
  }
}