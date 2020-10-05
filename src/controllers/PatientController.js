const db = require('../database/database');

module.exports = {
  async index(req, res) {
    db.select().table('patient')
      .then(data => {
        return res.json(data);
      })
      .catch(err => {
        console.error(err);
      })
  },
  async update(req, res) {
    const { id } = req.params;
    const { cpf, name, fone, occupation, age, gender } = req.body;
    const data = { cpf, name, fone, occupation, age, gender };

    db.where(id).update(data).table('patient')
      .then(data => {
        console.log(data);

        return res.json(data);
      })
      .catch(err => {
        console.error(err);

        return res.json(err);
      });
  },
  async store(req, res) {
    const { cpf, name, fone, occupation, age, gender } = req.body;
    const data = { cpf, name, fone, occupation, age, gender };

    try {
      const patient = await db.insert(data).into("patient");
      console.log(patient);
      return res.json(patient);
    } catch (error) {
      return res.json(error);
    }

  },
  async destroy(req, res) {
    const id = req.params;

    db.where(id).delete().table('patient')
      .then(data => {
        console.log(data);

        return res.json(data);
      })
      .catch(err => {
        console.error(err);

        return res.json(err);
      })
  }
}