const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Game = require('../models/Game');


// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

//List All Game
router.get('/showAllGame', function (req, res) {
  // mongoose operations are asynchronous, so you need to wait 
  Game.find({}, function (err, data) {
    // note that data is an array of objects, not a single object!
    res.render('showAllGame.ejs', {
      practices: data
    });

  });
});


router.get('/updateAndDelete', ensureAuthenticated, function (req, res) {
  // mongoose operations are asynchronous, so you need to wait 
  Game.find({}, function (err, data) {
    // note that data is an array of objects, not a single object!
    res.render('updateAndDelete.ejs', {
      user: req.user,
      practices: data
    });

  });
});



//Add Game Page
router.get('/addGame', ensureAuthenticated, (req, res) =>
  res.render('addGame', {
    user: req.user
  })
);

router.post('/addGame', (req, res, next) => {
  const { title, discription } = req.body;

  let errors = [];

  if (!title || !discription) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (errors.length > 0) {
    res.render('addGame', {
      errors,
      title,
      discription
    });
  } else {
    Game.findOne({ title: title }).then(game => {
      if (game) {
        errors.push({ msg: ' Game title already exists' });
        res.render('addGame', {
          errors,
          title,
          discription
        });
      } else {
        const newGame = new Game({
          title,
          discription
        });

        newGame.save().then(game => {
          req.flash(
            'success_msg',
            'Game added to the list'
          );
          res.redirect('/addGame');
        }).catch(err => {
          console.log(err);
        });

      }
    })
  }
});


router.get('/updateGame', ensureAuthenticated, (req, res) =>
  res.redirect('/updateAndDelete')
);
router.get('/deleteGame', ensureAuthenticated, (req, res) =>
  res.redirect('/updateAndDelete')
);

//Updata Game Page
router.post('/updateGame', (req, res, next) => {
  const { id, editTitle, editDiscription, title, discription } = req.body;
  let errors = [];
  var logTitle = title;
  var logDiscription = discription;

  if (!editTitle) {
    logDiscription = editDiscription;
  } else if (!editDiscription) {
    logTitle = editTitle;
  } else {
    logTitle = editTitle;
    logDiscription = editDiscription;
  }


  if (!editTitle && !editDiscription) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (errors.length > 0) {
    res.redirect('/updateAndDelete')
  } else {
    Game.findOne({ _id: id }).exec().then(game => {
      if (game) {
        
        Game.update({ _id: id }, {
          $set: {
            title: logTitle,
            discription: logDiscription
          }
        }).exec().then(game => {
          req.flash(
            'success_msg',
            'Game added to the list'
          );
          res.redirect('/updateAndDelete');
        }).catch(err => {
          console.log(err);
        });


        res.redirect('/updateAndDelete');
      }
    })
  }
});

//Delete Game Page
router.post("/deleteGame", (req, res, next) => {
  const title = req.body.title;
  let errors = [];
  if (!title) {
    errors.push({ msg: 'Please enter title' });
  } if (errors.length > 0) {
    res.redirect('/updateAndDelete');
  } else {
    Game.findOne({ title: title })
      .exec()
      .then(docs => {
        docs.remove();
        res.status(200).json({
          deleted: true
        });
      })
      .catch(err => {
        console.log(err)
        errors.push({ msg: 'Cannot Find This Game' });
      });

    res.redirect('/updateAndDelete');
  }
});

router.post('/dashboard', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/dashboard',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;
