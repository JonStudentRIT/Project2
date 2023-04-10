// expanded to include an aditional attribute that the user can use to give a
// larger in depth description of the domo

const models = require('../models');
const { db } = require('../models/Domo');

const { Domo } = models;

const makerPage = async (req, res) => res.render('app');

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name age backstory').lean().exec();
    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.backstory) {
    return res.status(400).json({ error: 'Please Fill out all fields' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    backstory: req.body.backstory,
    index: '',
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    // assign the index to the _id value
    newDomo.index = newDomo._id;
    await newDomo.save();
    return res.status(201).json(
      { name: newDomo.name, age: newDomo.age, backstory: newDomo.backstory },
    );
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making domo!' });
  }
};

// delete domo gos into the collection and deletes the first domo in this collection
const deleteDomo = async (req, res) => {
  try {
    db.collections.domos.deleteOne({ index: req.body.id });
    return res.status(201).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting domos!' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
  deleteDomo,
};
