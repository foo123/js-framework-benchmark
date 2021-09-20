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
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
    };
  }

  return data;
};

const Row = new ModelView.View.Component(`
<tr mv-id="{%=props.item.id%}" class="{%=props.selected ? 'danger' : ''%}">
<td class="col-md-1">{%=props.item.id%}</td>
<td class="col-md-4"><a mv-evt mv-on-click="SELECT" data-id="{%=props.item.id%}">{%=props.item.label%}</a></td>
<td class="col-md-1"><a mv-evt mv-on-click="REMOVE" data-id="{%=props.item.id%}"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>
<td class="col-md-6" />
</tr>
`);

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {data: [], selected: 0}))
    .template(`{%=
view.model().get('data').map(item => view.component('Row', {item:item, selected:item.id===view.$model.$data.selected})).join('')
%}`)
    .components({
        'Row': Row
    })
    .actions({
        'RUN': function() {
            this.model().set('selected', 0);
            this.model().set('data', buildData(1000), true);
        },
        'RUN_LOTS': function() {
            this.model().set('selected', 0);
            this.model().set('data', buildData(10000), true);
        },
        'ADD': function() {
            this.model().set('data', this.model().get('data').concat(buildData(1000)), true);
        },
        'UPDATE': function() {
              const newData = this.model().get('data').slice(0);
              for (let i = 0; i < newData.length; i += 10) {
                const r = newData[i];

                newData[i] = { id: r.id, label: r.label + " !!!" };
              }
              this.model().set('data', newData, true);
        },
        'CLEAR': function() {
            this.model().set('selected', 0);
            this.model().set('data', [], true);
        },
        'SWAP_ROWS': function() {
          const data = this.model().get('data');
          if (data.length > 998) {
            const t = data[1];
            data[1] = data[998];
            data[998] = t;
          }
            this.model().notify('data');
        },
        'REMOVE': function(evt, el) {
          const id = +el.getAttribute('data-id');
          const data = this.model().get('data');
          const idx = data.findIndex((d) => d.id === id);
          data.splice(idx, 1);
          this.model().notify('data');
        },
        'SELECT': function(evt, el) {
            this.model().set('selected', +el.getAttribute('data-id'), true);
        }
    })
    .autovalidate(false)
    .autobind(false)
    .livebind(true)
    .bind(['click'], document.getElementById('main'), document.getElementById('tbody'))
    .render()
;
