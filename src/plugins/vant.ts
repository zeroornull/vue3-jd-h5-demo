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
import 'vant/es/button/style'
import 'vant/es/checkbox/style'
import 'vant/es/checkbox-group/style'
import 'vant/es/count-down/style'
import 'vant/es/empty/style'
import 'vant/es/icon/style'
import 'vant/es/picker/style'
import 'vant/es/popup/style'
import 'vant/es/stepper/style'
import 'vant/es/swipe/style'
import 'vant/es/swipe-item/style'
import 'vant/es/tab/style'
import 'vant/es/tabbar/style'
import 'vant/es/tabbar-item/style'
import 'vant/es/tabs/style'

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
