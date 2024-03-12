import React from 'react'
import { Label } from 'semantic-ui-react'

const LabelExampleImage = () => (
  <div>
    <Label as='a' image>
      <img alt='joe' src='./images/joe.jpg' />
      Joe
    </Label>
    <Label as='a' image>
      <img alt='elliot' src='./images/elliot.jpg' />
      Elliot
    </Label>
    <Label as='a' image>
      <img alt='stevie' src='./images/stevie.jpg' />
      Stevie
    </Label>
  </div>
)

export default LabelExampleImage