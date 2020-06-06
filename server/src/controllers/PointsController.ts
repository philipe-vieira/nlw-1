import { Request, Response } from 'express'
import knex from "../database/connection";

interface PointItem {
  item_id: number,
  point_id: number
}

class PointsController {
  async index (req: Request, res: Response){
    const { city, uf, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map( item => Number(item.trim()))
    
    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id' )
      .whereIn('point_items.item_id', parsedItems)
      .where({ city: String(city), uf: String(uf) })
      .distinct()
      .select('points.*')

    const serializedPoints = points.map( point => {
      return {
        ...point,
        image_url: `http://10.0.0.102:3333/uploads/${point.image}`
      }
    })

    return res.json( serializedPoints )
  }

  async show (req: Request, res: Response){
    const { id } = req.params

    const point = await knex('points').where({ id }).first()

    if(!point) return res.status(404).json({ msg: 'Point not found.'})
    
    const items = await knex('items').select('title')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id);
      
    point.items = items

    const serializedPoint =  {
      ...point,
      image_url: `http://10.0.0.102:3333/uploads/${point.image}`
    }

    return res.json( serializedPoint )
  }

  async store (req: Request, res: Response){ 
  const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body

    const point = { name, email, image: req.file.filename, whatsapp, latitude, longitude, city, uf }

    const trx = await knex.transaction();
    const [pointId] = await trx('points')
      .insert(point)
  
    const pointItems = items
      .split(',')
      .map( (item: string) => Number(item.trim()) )
      .map( (item_id: number) => {
        return {
          item_id,
          point_id: pointId
        }
      })
  
    await trx('point_items').insert( pointItems )

    await trx.commit()
  
    const itemsID = pointItems.map( (item_point: PointItem) => item_point.item_id )

    return res.json({ id: pointId, ...point, items: itemsID } )
  }
}

export default PointsController