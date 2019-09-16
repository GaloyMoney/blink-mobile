import { DataStoreModel, DataStore } from "./data-store"

test("can be created", () => {
  const instance: DataStore = DataStoreModel.create({})

  expect(instance).toBeTruthy()
})