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
      id: nextId++,
      label: A[random(A.length)]+' '+C[random(C.length)]+' '+N[random(N.length)],
      selected: ''
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

const list = new ModelView.Model.Collection([]);
let selected = null;

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {list: list}))
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
                //this.model().set('list.'+i+'.label', items[i].label+" !!!", true);
                list.set(i, {id: items[i].id, label: items[i].label+" !!!", selected: items[i].selected});
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
                let t1 = list.items()[1], t998 = list.items()[998];
                list.set(1, {id:t998.id, label:t998.label, selected:t998.selected});
                list.set(998, {id:t1.id, label:t1.label, selected:t1.selected});
                this.model().notify('list');
            }
        },
        'REMOVE': function(evt, el) {
            const id = +el.dataset.id;
            const idx = /*findIndex(tr)*/list.items().findIndex(item => item.id === id);
            list.splice(idx, 1);
            if (this.$renderdom.children[idx] === selected) selected = null;
            this.model().notify('list');
        },
        'SELECT': function(evt, el) {
            const id = +el.dataset.id;
            let idx = list.items().findIndex(item => item.id === id);
            const tr = this.$renderdom.children[idx];
            let item;
            // framework idiomatically allows that the specifics of this action can be handled faster
            // realistic use with no loss of generality
            if (selected !== tr) {
                tr.classList.add('danger');
                item = list.items()[idx];
                item.selected = 'danger';
                if (selected) {
                    id = +selected.id;
                    idx = list.items().findIndex(item => item.id === id);//findIndex(selected);
                    item = list.items()[idx];
                    item.selected = '';
                    selected.classList.remove('danger');
                }
                selected = tr;
            }
        }
    })
    .autovalidate(false)
    .option('model.events', false)
    .autobind(false)
    .livebind('text')
    .bind(['click'], document.getElementById('main'), document.getElementById('tbody'))
    .precompile()
    .sync()
;
