import express from 'express'
import { celebrate, Joi } from 'celebrate';
import multer from 'multer'
import multerConfig from './config/multer';

import ItemsController from './controllers/ItemsController'
import PointsController from './controllers/PointsController'

const routes = express.Router()
const upload = multer(multerConfig)
const points = new PointsController
const items = new ItemsController

routes.get('/', (req, res )=>{
  return res.json({ worked: true})
})

routes.get('/items', items.index)

routes.get('/points', points.index )
routes.get('/points/:id', points.show )
routes.post(
  '/points',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(), 
      email: Joi.string().email().required(),
      whatsapp: Joi.number().required(), 
      latitude: Joi.number().required(), 
      longitude: Joi.number().required(), 
      city: Joi.string().required(), 
      uf: Joi.string().required().max(2),
      items: Joi.string().required()
    })
  }, { abortEarly: false }),
  upload.single('image'),
  points.store 
)

export default routes