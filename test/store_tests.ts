import 'should'

import { randomUUID } from 'crypto'
import MongoDbEventStore, { EventStore } from 'mongo-eventstore'
import { Db, MongoClient } from 'mongodb'

import {
  ProductAdjusted,
  ProductEvent,
  ProductReceived,
  ProductShipped
} from '../src/events'
import { AvailabilityProjection, projectAvailabilty } from '../src/projections'

describe('store', () => {
  let mongoClient: MongoClient
  let store: EventStore
  const streamName = `product-${randomUUID()}`
  let db: Db

  afterEach(async () => {
    await mongoClient.close()
  })

  beforeEach(async () => {
    mongoClient = await MongoClient.connect('mongodb://localhost:27017/test')
    db = mongoClient.db()

    store = await MongoDbEventStore(db, streamName)
  })
  it('should persist events', async () => {
    const adjusted: ProductAdjusted = {
      type: 'ProductAdjusted',
      data: {
        quantity: 10
      }
    }

    const received: ProductReceived = {
      type: 'ProductReceived',
      data: {
        quantity: 5
      }
    }

    const shipped: ProductShipped = {
      type: 'ProductShipped',
      data: {
        quantity: 14
      }
    }

    const streamId = randomUUID()
    await store.appendToStream(streamId, [adjusted, received, shipped])
    const events = await store.readStream(streamId)
    events.length.should.equal(3)
  })

  it('should create projection', async () => {
    const adjusted: ProductAdjusted = {
      type: 'ProductAdjusted',
      data: {
        quantity: 10
      }
    }

    const received: ProductReceived = {
      type: 'ProductReceived',
      data: {
        quantity: 5
      }
    }

    const shipped: ProductShipped = {
      type: 'ProductShipped',
      data: {
        quantity: 14
      }
    }

    const streamId = randomUUID()
    await store.appendToStream(streamId, [adjusted, received, shipped])
    const events = (await store.readStream(streamId)) as ProductEvent[]
    const projection = store.aggregateStream(events, projectAvailabilty)
    projection.quantity.should.equal(1)
  })

  it('should create all projections', async () => {
    const adjusted: ProductAdjusted = {
      type: 'ProductAdjusted',
      data: {
        quantity: 10
      }
    }

    const received: ProductReceived = {
      type: 'ProductReceived',
      data: {
        quantity: 5
      }
    }

    const shipped: ProductShipped = {
      type: 'ProductShipped',
      data: {
        quantity: 14
      }
    }
    const eventstore = await MongoDbEventStore(db, streamName, [
      {
        projectionType: 'CustomerNamesProjection',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        project: projectAvailabilty as any
      }
    ])
    const streamId = randomUUID()

    await eventstore.appendToStream(streamId, [adjusted, received, shipped])

    const projections = await eventstore.aggregateAll()
    ;(projections[0] as AvailabilityProjection).quantity.should.equal(1)
  })
})
