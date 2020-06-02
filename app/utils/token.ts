import { saveString, loadString, remove } from "./storage"
const  jwtDecode = require('jwt-decode')

const key = "GaloyToken"

// Singleton class
export class Token {
  mem_token = ""

  constructor() {
    const instance = this.constructor.instance;
    if (instance) {
        return instance;
    }

    this.constructor.instance = this;
  }

  async save({token}) {
    this.mem_token = token
    return await saveString(key, token)
  }

  async load (){
    this.mem_token = await loadString(key)
    return this.mem_token
  }

  async delete () {
    this.mem_token = ""
    remove(key)
  }

  get () {
    return this.mem_token
  }

  has () {
    return this.mem_token !== ""
    // TODO check
  }

  uid () {
    try {
      console.tron.log(this.mem_token)
      const { uid } = jwtDecode(this.mem_token)
      console.tron.log({uid})
      return uid
    } catch (err) {
      console.tron.log(err.toString())
      return null
    }
  }
  // todo Add network
}

