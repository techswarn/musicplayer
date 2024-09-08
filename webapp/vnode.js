function $(tag, attr, children){
    const t = document.createElement(tag)

    if(attr){
        const keys = Object.keys(attr)
        for(let i=0,l=keys.length; i<l; i++){
            const k = keys[i]
            t[k] = attr[k]
        }
    }

    if(typeof children === "string" || typeof children === "number"){
        t.appendChild(document.createTextNode(children))
    }else if(children){
        t.append(...children)
    }

    return t
}

class VNode{
    constructor(parent){
        this.root = typeof parent === "string" ? document.querySelector(parent) : parent
    }

    clear(){
        while(this.root.firstChild){
            this.root.removeChild(this.root.lastChild)
        }
    }

    append(element){
        this.root.appendChild(element)
    }

    appendAll(element){
        this.root.append(...element)
    }
}

class VList extends VNode{
    constructor(parent, config){
        super(parent)
        this.template = config.template
    }

    async loadData(getRoute){
        const res = await fetch(getRoute)

        this.addAll(await res.json())
    }

    add(data){
        this.root.appendChild(this.template(data))
    }

    addAll(data){
        this.root.append(...data.map(x => this.template(x)))
    }
}

class VForm extends VNode{
    constructor(parent){
        super(parent)
    }

    json(){
        const el = this.root.querySelectorAll("input[name],button[name]")
        const dataObj = {}
        Object.entries(el).forEach((x) => {
            const {name, value} = x[1]
            dataObj[name] = value
        })

        return JSON.stringify(dataObj)
    }

    async ajax(url, method = "GET"){
        const config =  {
            method,
            headers: {
                "Content-Type": "application/json"
            }
        }

        if(method === "post"){
            config.body = this.json()
        }

        const ajax = await fetch(url, config)

        return await ajax.json()
    }

    reset(){
        this.root.reset()
    }
}