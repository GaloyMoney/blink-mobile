/*
 * This exposes the native GeeTestModule module as a JS module.
 *
 * This has a function 'createCalendarEvent' which takes the following parameters:
 *
 * 1. String name: A string representing the name of the event
 * 2. String location: A string representing the location of the event
 */
import { NativeModules } from "react-native"
const { GeeTestModule } = NativeModules
interface GeeTestInterface {
  setUp(): void
  tearDown(): void
  handleRegisteredGeeTestCaptcha(params: string): void
}
export default GeeTestModule as GeeTestInterface
