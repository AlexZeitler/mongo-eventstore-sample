import { Event, Projection } from 'mongo-eventstore'

export type ProductReceived = Event<'ProductReceived', { quantity: number }>
export type ProductShipped = Event<'ProductShipped', { quantity: number }>
export type ProductAdjusted = Event<'ProductAdjusted', { quantity: number }>

export type ProductEvent = ProductAdjusted | ProductReceived | ProductShipped
