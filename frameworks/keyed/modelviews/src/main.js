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

const list = new ModelView.Model.Collection([]);
let selected = null;

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {list: list}))
    .actions({
        'RUN': function() {
            selected = null;
            list.replace(buildData(1000));
            this.model().notify('list');
        },
        'RUN_LOTS': function() {
            selected = null;
            list.replace(buildData(10000));
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
                list.swap(1, 998);
                this.model().notify('list');
            }
        },
        'REMOVE': function(evt, el) {
            const id = +el.parentNode.parentNode.id;
            const items = list.items();
            const idx = items.findIndex(item => item.id === id);
            list.splice(idx, 1);
            if (this.$renderdom.children[idx] === selected) selected = null;
            this.model().notify('list');
        },
        'SELECT': function(evt, el) {
            const id = +el.parentNode.parentNode.id;
            const items = list.items();
            let idx = items.findIndex(item => item.id === id);
            const tr = this.$renderdom.children[idx];
            let item;
            // framework idiomatically allows that the specifics of this action can be handled faster
            // realistic use with no loss of generality
            if (selected !== tr) {
                item = items[idx];
                item.selected = 'danger';
                tr.classList.add('danger');
                if (selected) {
                    let sid = +selected.id;
                    items[items.findIndex(item => item.id === sid)].selected = '';
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
