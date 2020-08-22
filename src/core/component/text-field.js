/*
 * @Description: 文本输入框组件
 * @Auth: Oliver <81092048@qq.com>
 * @Date: 2020-08-21 22:50:22
 * @FilePath: /graffiti.js/src/core/component/text-field.js
 */

import {
  TEXT_FIELD_FOUCS,
  CONTAINER_CLICK,
  TEXT_FIELD_DELETE,
} from '../constant/event'

export default class TextField {
  /**
   * 组件构造函数
   * @param {*} graffiti 主对象
   * @param {*} tag html标签
   * @param {*} config 元素配置
   */
  constructor(graffiti, tag, config) {
    const container = graffiti.container
    this.graffiti = graffiti
    this.container = container
    this.document = document.createElement(tag)
    this.config = config
    this.init(config)

    // 获取菜单对象
    const graffitiMenu = document.getElementById('graffiti__menu')

    // 获取dom对象
    let li = this.document
    li.style.userSelect = 'none'

    let element = document.createElement('div')
    element.className = 'element'
    let span = document.createElement('span')
    span.innerText = config.text || '双击编辑文本'
    element.onclick = (e) => {
      graffitiMenu.style.display = 'none'
      li.classList.remove('item-comp-hover')
      li.classList.add('item-comp-border')
      graffiti.listener[TEXT_FIELD_FOUCS] &&
        graffiti.listener[TEXT_FIELD_FOUCS](this)
      e.stopImmediatePropagation()
    }
    element.ondblclick = (e) => {
      this.stop()
      span.contentEditable = 'true'
      setTimeout(() => {
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents(span)
        selection.removeAllRanges()
        selection.addRange(range)
      }, 0)
      e.stopImmediatePropagation()
    }

    this.container.onclick = () => {
      this.render()
      graffitiMenu.style.display = 'none'
      li.classList.add('item-comp-hover')
      li.classList.remove('item-comp-border')
      graffiti.listener[CONTAINER_CLICK] && graffiti.listener[CONTAINER_CLICK]()
    }
    span.onblur = (e) => {
      this.render()
      li.classList.add('item-comp-hover')
      li.classList.remove('item-comp-border')
      e.preventDefault()
    }

    element.appendChild(span)

    let elementBox = document.createElement('div')
    elementBox.className = 'element-box'
    elementBox.appendChild(element)
    // 添加内部对象
    li.appendChild(elementBox)

    this.initContextMenuEvent(graffitiMenu, li)
  }

  // 获取组件真实dom对象
  get componentElement() {
    return this.document
  }

  /**
   * 初始化组件
   */
  init(config) {
    // 配置样式
    let { x = 0, y = 0, classList = [], style = {}, data = {} } =
      config || this.config
    this.document.classList = classList
    for (const key in style) {
      this.document.style[key] = style[key]
    }
    for (const key in data) {
      this.document.dataset[key] = data[key]
    }
    this.document.style.left = `${x}px`
    this.document.style.top = `${y}px`
  }

  /**
   * 初始化自定义菜单显示事件
   */
  initContextMenuEvent(graffitiMenu, element) {
    // 获取菜单对象
    // const graffitiMenu = document.getElementById('graffiti__menu')
    // 自定义右键菜单
    element.oncontextmenu = (event) => {
      // 获取当前点击的坐标数据
      const { x, y } = event
      // 获取容器数据
      const {
        offsetTop,
        offsetHeight,
        offsetLeft,
        offsetWidth,
      } = this.container

      // 显示菜单
      graffitiMenu.style.display = 'block'
      graffitiMenu.style.left = `${x}px`
      // 判断菜单是否超出底部
      if (offsetTop + offsetHeight < y + graffitiMenu.offsetHeight) {
        graffitiMenu.style.top = `${y - graffitiMenu.offsetHeight - 10}px`
      } else {
        graffitiMenu.style.top = `${y}px`
      }
      // 判断菜单是否超出右侧
      if (offsetLeft + offsetWidth < x + graffitiMenu.offsetWidth) {
        graffitiMenu.style.left = `${x - graffitiMenu.offsetWidth - 10}px`
      } else {
        graffitiMenu.style.left = `${x}px`
      }
      return false
    }

    // 获取删除
    const graffitiMenuDelete = graffitiMenu.querySelector(
      '.graffiti__menu__delete'
    )
    graffitiMenuDelete.onclick = () => {
      element.remove()
      graffitiMenu.style.display = 'none'
      this.graffiti.listener[TEXT_FIELD_DELETE] &&
        this.graffiti.listener[TEXT_FIELD_DELETE](element)
      this.destory()
    }
  }

  /**
   * div 拖动事件
   */
  onMove() {
    let sent = {
      l: 0, //设置div在父元素的活动范围，10相当于给父div设置padding-left：10;
      r: this.container.offsetWidth - this.document.offsetWidth, // offsetWidth:当前对象的宽度， offsetWidth = width+padding+border
      t: 0,
      b: this.container.offsetHeight - this.document.offsetHeight,
      n: 10,
    }
    this.onMoveOutBoundary(this.document, sent)
  }

  /**
   * 边界
   * @param obj 被拖动的div
   * @param sent 设置div在容器中可以被拖动的区域
   */
  onMoveOutBoundary(obj, sent = {}) {
    let dmW = document.documentElement.clientWidth || document.body.clientWidth
    let dmH =
      document.documentElement.clientHeight || document.body.clientHeight

    let l = sent.l || 0
    let r = sent.r || dmW - obj.offsetWidth
    let t = sent.t || 0
    let b = sent.b || dmH - obj.offsetHeight
    let n = sent.n || 10

    obj.onmousedown = function (ev) {
      let oEvent = ev || event
      let sentX = oEvent.clientX - obj.offsetLeft
      let sentY = oEvent.clientY - obj.offsetTop

      document.onmousemove = function (ev) {
        let oEvent = ev || event

        let slideLeft = oEvent.clientX - sentX
        let slideTop = oEvent.clientY - sentY

        if (slideLeft <= l) {
          slideLeft = l
        }
        if (slideLeft >= r) {
          slideLeft = r
        }
        if (slideTop <= t) {
          slideTop = t
        }
        if (slideTop >= b) {
          slideTop = b
        }

        obj.style.left = slideLeft + 'px'
        obj.style.top = slideTop + 'px'
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }

      return false
    }
  }

  /**
   * 渲染组件在容器中显示
   */
  render() {
    if (this.container && this.document) {
      this.container.appendChild(this.document)
      this.onMove()
    }
  }

  /**
   * 停止移动
   */
  stop() {
    document.onmouseup = null
    this.document.onmousedown = null
  }

  /**
   * 设置样式
   * @param {*} style
   */
  setStyle(style) {
    for (const key in style) {
      this.document.style[key] = style[key]
    }
  }

  /**
   * 销毁
   */
  destory() {
    this.graffiti = null
    this.document = null
  }
}