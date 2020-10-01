const db = require('../database/database');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

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

    if (user)
      user = user.toLowerCase();

    const login = await db.where({ user, password }).select(['id']).table('user');

    console.log(login)

    if (login === null || login.length == 0)
      return res.json({ message: "Usuário e/ou senha incorretos ou inativo" });

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
    const user = await db.where({ email }).select().table('user');

    if (!user.length)
      return res.json({ msg: "E-mail não cadastrado na base de dados" });

    // return res.json({ msg: "Te enviamos um e-mail para a recuperação de sua senha", email: user[0].email, code: 200 });

    const code = makeCode(8);

    db.insert({ code, user_id: user[0].id, timestamp: Date.now() }).table('reset_password_user')
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
      to: user[0].email,
      subject: 'Recuperação de senha',
      html: messageEmail(user[0].name, code)
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("::: Status: Erro ao enviar o e-mail!!!");
        console.log(err);

        return res.json({ msg: "Erro ao enviar o e-mail", error: err, code: 500 });
      } else {
        console.log("::: Status: Email enviado com sucesso!!!");

        return res.json({ msg: "Te enviamos um e-mail para a recuperação de sua senha", error: err, email: user[0].email, code: 200 });
      }
    });

  },
  async confirmPinReset(req, res) {
    const { email, code } = req.body;

    const regs = await db.where({ email })
      .select()
      .table('user')
      .innerJoin("reset_password_user", "reset_password_user.user_id", "user.id")
      .orderBy("user.id", "desc");

    if (regs[0].code = code)
      return res.json({ msg: "Código informado confirmado", code: 200 });


    console.log(regs[0]);
  },
  async resetPass(req, res) {
    const { pass, passConfirm, email } = req.body;

    console.log(pass, passConfirm, email);

    if (pass !== passConfirm)
      return res.json({ msg: "Senhas não combinam", code: 401 });

    await db.where({ email }).update({ password: pass }).table('user');


    return res.json({ msg: "Senha alterada com sucessso", code: 200 });
  }
}