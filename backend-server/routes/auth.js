const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(401).json({
        message: '같은 계정의 사용자가 존재합니다.'
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.status(200).json({
      message: '회원 가입 성공'
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  // id, password match
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      const result = await bcrypt.compare(password, exUser.password);
      if (!result) {
        return res.status(401).json({
          message: 'wrong password',
        });
      }
    } else {
      return res.status(401).json({
        message: 'no such account',
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }

  // post token
  try {
    const accesstoken = jwt.sign({
      email: email,
    }, process.env.JWT_SECRET, {
      expiresIn: '30m', // 30 minute
      issuer: 'admin',
    });

    const refreshtoken = jwt.sign({
      email: email,
    }, process.env.JWT_SECRET, {
      expiresIn: '30d', // 30 days
      issuer: 'admin',
    });

    return res.status(200).json({
      message: 'login succeed',
      accesstoken,
      refreshtoken,
    })

  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get('/logout', (req, res) => {
  // client shoud expire token
  res.status(200).json({message: 'logout'});
});

// router.get('/kakao', passport.authenticate('kakao'));

// router.get('/kakao/callback', passport.authenticate('kakao', {
//   failureRedirect: '/',
// }), (req, res) => {
//   res.redirect('/');
// });

module.exports = router;