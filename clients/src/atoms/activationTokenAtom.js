import { atom } from 'recoil'
const activationToken = atom({
  key: "activationToken",
  default: ''
})

export default activationToken; 