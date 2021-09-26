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
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`
    };
  }

  return data;
};

const Row = new ModelView.View.Component('Row', `
<tr mv-id={props.item.id} id={props.item.id} class={props.selected ? 'danger' : ''}>
<td class="col-md-1">{props.item.id}</td>
<td class="col-md-4"><a mv-evt mv-on-click="SELECT">{props.item.label}</a></td>
<td class="col-md-1"><a mv-evt mv-on-click="REMOVE"><span class="glyphicon glyphicon-remove" aria-hidden="true"/></a></td>
<td class="col-md-6"/>
</tr>
`, {
    changed: (oldProps, newProps, prevIndex, newIndex) => (oldProps.item !== newProps.item) || (oldProps.selected !== newProps.selected) /*|| (prevIndex !== newIndex)*/
});

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {data: [], selected: 0}))
    .template(`{
    view.model().get('data').map(item => view.component('Row', item.id, {item:item, selected:item.id===view.$model.$data.selected}))
}`)
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
            this.$model.$data.data = this.$model.$data.data.concat(buildData(1000));
            this.model().notify('data');
        },
        'UPDATE': function() {
            const data = this.$model.$data.data;
            for (let i = 0; i < data.length; i += 10) {
                //data[i].label += " !!!";
                data[i] = {id: data[i].id, label: data[i].label+" !!!"};
            }
            this.model().notify('data');
        },
        'CLEAR': function() {
            this.model().set('selected', 0);
            this.model().set('data', [], true);
        },
        'SWAP_ROWS': function() {
          const data = this.$model.$data.data;
          if (data.length > 998) {
            const t = data[1];
            data[1] = data[998];
            data[998] = t;
            this.model().notify('data');
            // faster idiomatic use, but will not be used here
            /*this
                .moveNode(this.$renderdom, document.getElementById(data[998].id), 998)
                .moveNode(this.$renderdom, document.getElementById(data[1].id), 1)
            ;*/
          }
        },
        'REMOVE': function(evt, el) {
          const data = this.$model.$data.data;
          const tr = el.closest('tr');
          const id = +tr.id;
          const idx = data.findIndex((d) => d.id === id);
          data.splice(idx, 1);
          if (id === this.$model.$data.selected) this.$model.$data.selected = 0;
          //this.model().notify('data');
          // framework idiomatically allows that the specifics of this action can be handled faster
          // realistic use with no loss of generality
          this.removeNode(tr);
        },
        'SELECT': function(evt, el) {
            const selectedPrev = this.model().get('selected');
            const tr = el.closest('tr');
            const selected = +tr.id;
            // framework idiomatically allows that the specifics of this action can be handled faster
            // realistic use with no loss of generality
            if (selectedPrev !== selected)
            {
                this.model().set('selected', selected/*, true*/);
                if (selectedPrev)
                {
                    const selectedRow = document.getElementById(String(selectedPrev));
                    if (selectedRow) selectedRow.classList.remove('danger');
                }
                tr.classList.add('danger');
            }
        }
    })
    .autovalidate(false)
    .autobind(false)
    .livebind(true)
    .bind(['click'], document.getElementById('main'), document.getElementById('tbody'))
    .render()
;
