import Knex from 'knex'

export async function seed(knex: Knex) {
  return await knex('items').del()
    .then( function () {
      return knex('items').insert([
        { title: 'Lampadas', image: 'lampadas.svg'},
        { title: 'Pilhas e baterias', image: 'baterias.svg'},
        { title: 'Papéis e papelão', image: 'papeis-papelao.svg'},
        { title: 'Resíduos eletrônicos', image: 'eletronicos.svg'},
        { title: 'Resíduos orgânicos', image: 'organicos.svg'},
        { title: 'Óleo de cozinha', image: 'oleo.svg'}
      ])
    })
}
