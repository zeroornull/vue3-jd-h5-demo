import type { App } from 'vue'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  CountDown,
  Empty,
  Icon,
  Picker,
  Popup,
  Stepper,
  Swipe,
  SwipeItem,
  Tab,
  Tabbar,
  TabbarItem,
  Tabs,
} from 'vant'
import 'vant/lib/index.css'

const components = [
  Button,
  Checkbox,
  CheckboxGroup,
  CountDown,
  Empty,
  Icon,
  Picker,
  Popup,
  Stepper,
  Swipe,
  SwipeItem,
  Tab,
  Tabbar,
  TabbarItem,
  Tabs,
]

export function installVant(app: App): void {
  for (const component of components) {
    app.use(component)
  }
}
