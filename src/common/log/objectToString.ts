export function filterDefault(obj) {
  if (
    typeof EventTarget !== 'undefined' && obj instanceof EventTarget
    && (typeof EventSource === 'undefined' || !(obj instanceof EventSource))
  ) {
    return false
  }

  return true
}

function getEventTargets(event: Event): any[] {
  const elements = []
  function _push(target: any) {
    if (!target || elements.includes(target)) {
      return
    }
    elements.push(target)
  }
  function push(target: any) {
    if (Array.isArray(target)) {
      for (let i = 0, len = target.length; i < len; i++) {
        _push(target[i])
      }
    }
    else {
      _push(target)
    }
  }
  push(event.target || event.srcElement)
  push(event.currentTarget)
  push((event as any).path)
  if (typeof event.composedPath === 'function') {
    try {
      push(event.composedPath())
    }
    catch (err) {
      // empty
    }
  }

  return elements
}

function getEventErrors(event: Event): any[] {
  const errors = []
  const targets = getEventTargets(event)
  for (let i = 0, len = targets.length; i < len; i++) {
    const target = targets[i]
    let countProperties = 0
    const error = {} as any
    if (target.error) {
      error.error = target.error
      countProperties++
    }
    if (target.reason) {
      error.reason = target.reason
      countProperties++
    }
    if (target.readyState) {
      error.readyState = target.readyState
      countProperties++
    }
    if (target.status) {
      error.status = target.status
      countProperties++
    }
    if (target.src || target.currentSrc) {
      error.src = target.src || target.currentSrc
      countProperties++
    }

    if (countProperties > 0) {
      errors.push(error)
    }
  }

  return errors
}

let nextId = 1
const objectsMap = new WeakMap()
function getObjectUniqueId(obj) {
  let id = objectsMap.get(obj)
  if (id == null) {
    id = nextId++
    objectsMap.set(obj, id)
  }
  return id
}

export function objectToString(object: any, {
  maxLevel = 15,
  maxValueSize = 5000,
  maxFuncSize = 100,
  maxProperties = 50,
  maxListSize = 10,
  maxResultSize = 50000,
  filter = filterDefault,
}: {
  maxLevel: number,
  maxValueSize: number,
  maxFuncSize: number,
  maxProperties: number,
  maxListSize: number,
  maxResultSize: number,
  filter: (object: any) => boolean,
} = {} as any): string {
  if (object == null) {
    return object + ''
  }

  const buffer: string[] = []

  let resultSize = 0
  const OVERFLOW = new String('Overflow')

  function appendBuffer(value: string, maxSize?: number) {
    let _maxSize = Math.min(value.length, maxValueSize, maxResultSize - resultSize)
    if (maxSize != null && _maxSize > maxSize) {
      _maxSize = maxSize
    }

    if (value.length > _maxSize) {
      value = value.substring(0, _maxSize) + '...'
    }
    buffer.push(value)
    resultSize += value.length

    if (resultSize >= maxResultSize) {
      buffer.push('...')
      resultSize += 3
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw OVERFLOW
    }
  }

  const objectsSet = new Set()

  const append = (obj, tabs, level = 0) => {
    if (typeof obj === 'undefined') {
      appendBuffer('undefined')
      return
    }

    if (obj === null) {
      appendBuffer('null')
      return
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      appendBuffer(obj.toString())
      return
    }

    if (typeof obj === 'string') {
      appendBuffer('"')
      appendBuffer(obj)
      appendBuffer('"')
      return
    }

    if (obj instanceof Date) {
      appendBuffer('<Date> ')
      appendBuffer(Number.isNaN(obj.getTime()) ? 'NaN' : obj.toISOString())
      return
    }

    if (typeof Element !== 'undefined' && obj instanceof Element) {
      appendBuffer('<')
      appendBuffer(obj.constructor.name)
      appendBuffer('> ')

      appendBuffer('<')
      appendBuffer(obj.tagName.toLowerCase())
      const attrNames = obj.getAttributeNames()
      for (let i = 0, len = attrNames.length; i < len; i++) {
        const name = attrNames[i]
        const value = obj.getAttribute(name)
        appendBuffer(' ')
        appendBuffer(name)
        appendBuffer('="')
        appendBuffer(value)
        appendBuffer('"')
      }

      // const html = obj.outerHTML
      // const tagEnd = html.indexOf('>')
      // appendBuffer(html.substring(0, tagEnd + 1))

      return
    }

    if (obj instanceof Error) {
      obj = {
        constructor: obj.constructor,
        message    : obj.message,
        stack      : obj.stack || obj.toString(),
        ...obj,
      } as any
    }

    if (typeof obj === 'object') {
      if (obj.valueOf) {
        const value = obj.valueOf()
        if (value !== obj) {
          if (obj.constructor) {
            appendBuffer('<')
            appendBuffer(obj.constructor.name)
            const id = getObjectUniqueId(obj)
            if (id) {
              appendBuffer('-')
              appendBuffer(id.toString())
            }
            appendBuffer('> ')
          }
          append(value, tabs, level)
          return
        }
      }

      if (level >= maxLevel) {
        appendBuffer('...')
        return
      }

      level++

      if (!filter(obj)) {
        appendBuffer('<')
        appendBuffer(obj.constructor.name)
        appendBuffer('> {...}')
        return
      }

      let maxCount = maxProperties
      let _maxListSize = maxListSize
      if (objectsSet.has(obj)) {
        maxCount = 0
        _maxListSize = 0
      }
      else {
        objectsSet.add(obj)
      }

      if (Array.isArray(obj)) {
        appendBuffer('[')
        maxCount = _maxListSize
      }
      else if (obj.constructor) {
        appendBuffer('<')
        appendBuffer(obj.constructor.name)
        const id = getObjectUniqueId(obj)
        if (id) {
          appendBuffer('-')
          appendBuffer(id.toString())
        }
        appendBuffer('> {')
      }
      else {
        appendBuffer('{')
      }

      const newTabs = tabs + '\t'

      let index = 0

      if (typeof Event === 'function' && obj instanceof Event) {
        const errors = getEventErrors(obj)

        if (index === 0) {
          appendBuffer('\r\n')
        }
        else {
          appendBuffer(',\r\n')
        }

        appendBuffer(newTabs)
        appendBuffer('_errors')
        appendBuffer(': ')
        append(errors, newTabs, level)

        index++
      }

      if (index >= maxCount) {
        appendBuffer('...')
        if (index > 0) {
          appendBuffer('\r\n')
        }
      }
      else {
        // eslint-disable-next-line guard-for-in
        for (const key in obj) {
          if (index === 0) {
            appendBuffer('\r\n')
          }
          else {
            appendBuffer(',\r\n')
          }

          if (index >= maxCount) {
            appendBuffer(newTabs)
            appendBuffer('...\r\n')
            break
          }

          appendBuffer(newTabs)
          appendBuffer(key === '' ? '""' : key)
          appendBuffer(': ')
          append(obj[key], newTabs, level)

          index++
        }
      }

      if (index > 0) {
        appendBuffer(',\r\n')
        appendBuffer(tabs)
      }
      if (Array.isArray(obj)) {
        appendBuffer(']')
      }
      else {
        appendBuffer('}')
      }

      if (!Array.isArray(obj) && Symbol.iterator in obj) {
        appendBuffer('[')
        index = 0
        if (index >= _maxListSize) {
          appendBuffer('...')
        }
        else {
          // for (const item of obj) {
          try {
            for (let _iterator = obj[Symbol.iterator], _step; !(_step = _iterator()).done;) {
              const item = _step.value

              if (index > 0) {
                appendBuffer(',\r\n')
              }
              else {
                appendBuffer('\r\n')
              }

              appendBuffer(tabs)
              appendBuffer(index.toString())
              appendBuffer(': ')
              append(item, newTabs, level)

              index++
              if (index >= _maxListSize) {
                appendBuffer(newTabs)
                appendBuffer('...')
                break
              }
            }
          }
          catch (err) {
            appendBuffer('<iterate error>: ' + err.message)
          }
        }
        if (index > 0) {
          appendBuffer(',\r\n')
          appendBuffer(tabs)
        }
        appendBuffer(']')
      }

      return
    }

    if (typeof obj === 'function') {
      appendBuffer(obj.toString(), maxFuncSize)
    }
    else {
      appendBuffer(obj.toString())
    }
  }

  try {
    append(object, '', null)
  }
  catch (error) {
    if (error !== OVERFLOW) {
      throw error
    }
  }

  return buffer.join('')
}
