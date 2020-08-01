const jwt = require('jsonwebtoken');
const expressRouter = require('express').Router;
const config = require('../config');

const gameRouter = expressRouter();

gameRouter.get('/:jwt', (req, res) => {

  try {
    const token = new Buffer.from(req.params.jwt, 'base64').toString('ascii');
    const decoded = jwt.verify(token, config.SECRET);
    req.userFromAuth = decoded;
    res.cookie(config.TOKEN_COOKIE_NAME, token, { maxAge: 900000, httpOnly: false });    
    res.redirect('/static/game.html');
  } catch (e) {        
    res.status(401).send("You're not authenticated!");
  }

})

module.exports = gameRouter;