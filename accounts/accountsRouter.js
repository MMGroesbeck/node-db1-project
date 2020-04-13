const express = require('express');

const db = require('../data/dbConfig.js');

const router = express.Router();

// endpoints

router.get('/', (req, res) => {
    db.select('*').from('accounts')
    .then(accounts => {
        res.status(200).json({ data: accounts });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err.message });
    })
})

router.get('/:id', validateAccountId, (req, res) => {
    res.status(200).json({ data: req.account });
})

router.post('/', validateAccount, (req, res) => {
    db('accounts').insert({
        name: req.body.name,
        budget: req.body.budget
    })
    .then(ids => {
        const id = ids[0]
        db('accounts')
            .where({ id })
            .first()
            .then(account => {
                res.status(201).json({ data: account });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err.message });
            })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err.message });
    })
})

router.patch('/:id', validateAccountId, (req, res) => {
    db('accounts').where({ id: req.params.id }).update(req.body)
        .then(count => {
            if (count > 0) {
                res.status(200).json({ message: 'Update successful.' });
            } else {
                res.status(404).json({ message: 'No posts found by that id.' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        })
})

router.delete('/:id', validateAccountId, (req, res) => {
    db('accounts').where({ id: req.params.id }).del()
        .then(post => {
            res.status(200).json({ data: post });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.message });
        })
})

// middleware

function validateAccountId(req, res, next) {
    if (req.params.id){
        db('accounts').where({
            id: req.params.id
        })
        .then(account => {
            req.account = account;
            next();
        })
        .catch(err => {
            res.status(500).json({ message: err });
          })
      } else {
        res.status(400).json({ message: "Account id required."});
      }
}

function validateAccount(req, res, next) {
    if (req.body) {
      if (req.body.name) {
        if (req.body.budget) {
            next();
        } else {
            res.status(400).json({ message: "missing budget" });
        }
      } else {
        res.status(400).json({ message: "missing required name field" });
      }
    } else {
      res.status(400).json({ message: "missing account data" });
    }
  }

module.exports = router;