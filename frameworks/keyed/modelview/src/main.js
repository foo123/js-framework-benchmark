"use strict";

const random = (max) => Math.round(Math.random() * 1000) % max;

const A = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean",
  "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy"];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse",
  "keyboard"];

let nextId = 1;

const buildData = (count) => {
  const data = new Array(count);

  for (let i = 0; i < count; i++) {
    data[i] = {
      id: ModelView.Model.Value(nextId++),
      label: ModelView.Model.Value(A[random(A.length)]+' '+C[random(C.length)]+' '+N[random(N.length)]),
      selected: ModelView.Model.Value('')
    };
  }

  return data;
};

const findIndex = (node) => {
    let index = 0;
    while (node.previousElementSibling) {
        index++;
        node = node.previousElementSibling;
    }
    return index;
};

const parentRow = (node) => {
    while (node && ('TR' !== node.tagName)) {
        node = node.parentNode;
    }
    return node;
};

const Row = new ModelView.View.Component('Row', `
<tr mv-id={props.id} id={props.id} class={props.selected}>
<td class="col-md-1">{props.id}</td>
<td class="col-md-4"><a mv-evt mv-on-click="SELECT" data-id={props.id}>{props.label}</a></td>
<td class="col-md-1"><a mv-evt mv-on-click="REMOVE" data-id={props.id}><span class="glyphicon glyphicon-remove" aria-hidden="true"/></a></td>
<td class="col-md-6"/>
</tr>
`, {
    changed: (oldProps, newProps) => oldProps !== newProps
});

const list = new ModelView.Model.Collection([]);
let selected = null;

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {list: list}))
    .template(`{
    view.keyed(view.model().get('list').mapTo(item => (
        <Row id={item.id.val()} props={item}/>
    )))
}`)
    .components({
        'Row': Row
    })
    .actions({
        'RUN': function() {
            selected = null;
            list.set(buildData(1000));
            this.model().notify('list');
        },
        'RUN_LOTS': function() {
            selected = null;
            list.set(buildData(10000));
            this.model().notify('list');
        },
        'ADD': function() {
            list.concat(buildData(1000));
            this.model().notify('list');
        },
        'UPDATE': function() {
            const items = list.items(), l = items.length;
            for (let i = 0; i < l; i += 10) {
                list.set(i, {id: items[i].id, label: items[i].label.set(items[i].label.val()+" !!!"), selected: items[i].selected});
            }
            this.model().notify('list');
        },
        'CLEAR': function() {
            selected = null;
            list.set([]);
            this.model().notify('list');
        },
        'SWAP_ROWS': function() {
            if (list.items().length > 998) {
                list.swap(1, 998);
                this.model().notify('list');
            }
        },
        'REMOVE': function(evt, el) {
            const id = +el.dataset.id;
            const idx = /*findIndex(tr)*/list.items().findIndex(item => item.id.val() === id);
            list.splice(idx, 1);
            if (this.$renderdom.children[idx] === selected) selected = null;
            this.model().notify('list');
        },
        'SELECT': function(evt, el) {
            const id = +el.dataset.id;
            let idx = list.items().findIndex(item => item.id.val() === id);
            const tr = this.$renderdom.children[idx];
            let item;
            // framework idiomatically allows that the specifics of this action can be handled faster
            // realistic use with no loss of generality
            if (selected !== tr) {
                tr.classList.add('danger');
                item = list.items()[idx];
                item.selected.set('danger', true);
                if (selected) {
                    selected.classList.remove('danger');
                    idx = findIndex(selected);
                    item = list.items()[idx];
                    item.selected.set('', true);
                }
                selected = tr;
            }
        }
    })
    .autovalidate(false)
    .autobind(false)
    .livebind(true)
    .bind(['click'], document.getElementById('main'), document.getElementById('tbody'))
    .precompile()
    .render()
;
