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
      label: A[random(A.length)]+' '+C[random(C.length)]+' '+N[random(N.length)]
    };
  }

  return data;
};

const clone = (obj) => ({id:obj.id, label:obj.label});

const Row = new ModelView.View.Component('Row', `
<tr mv-id={props.id} id={props.id} class={props.id===view.$model.$data.selected ? 'danger' : ''}>
<td class="col-md-1">{props.id}</td>
<td class="col-md-4"><a mv-evt mv-on-click="SELECT">{props.label}</a></td>
<td class="col-md-1"><a mv-evt mv-on-click="REMOVE"><span class="glyphicon glyphicon-remove" aria-hidden="true"/></a></td>
<td class="col-md-6"/>
</tr>
`, {
    changed: (oldProps, newProps) => oldProps !== newProps
});

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {data: new ModelView.Model.Collection([]), selected: 0}))
    .template(`{
    view.model().get('data').mapTo(item => (<Row id={item.id} props={item}/>))
}`)
    .components({
        'Row': Row
    })
    .actions({
        'RUN': function() {
            this.$model.$data.selected = 0;
            this.$model.$data.data.set(buildData(1000));
            this.$model.notify('data');
        },
        'RUN_LOTS': function() {
            this.$model.$data.selected = 0;
            this.$model.$data.data.set(buildData(10000));
            this.$model.notify('data');
        },
        'ADD': function() {
            this.$model.$data.data.concat(buildData(1000));
            this.$model.notify('data');
        },
        'UPDATE': function() {
            const data = this.$model.$data.data, items = data.items(), l = items.length;
            for (let i = 0; i < l; i += 10) {
                data.set(i, {id: items[i].id, label: items[i].label+" !!!"});
            }
            this.$model.notify('data');
        },
        'CLEAR': function() {
            this.$model.$data.selected = 0;
            this.$model.$data.data.set([]);
            this.$model.notify('data');
        },
        'SWAP_ROWS': function() {
            const data = this.$model.$data.data, items = data.items();
            if (items.length > 998) {
                const t = items[1];
                data.set(1, clone(items[998]));
                data.set(998, clone(t));
                this.$model.notify('data');
            }
        },
        'REMOVE': function(evt, el) {
            const tr = el.closest('tr');
            const id = +tr.id;
            this.$model.$data.data.splice(this.$model.$data.data.items().findIndex((d) => d.id === id), 1);
            if (id === this.$model.$data.selected) this.$model.$data.selected = 0;
            this.$model.notify('data');
        },
        'SELECT': function(evt, el) {
            const selectedPrev = this.$model.$data.selected;
            const tr = el.closest('tr');
            const selected = +tr.id;
            // framework idiomatically allows that the specifics of this action can be handled faster
            // realistic use with no loss of generality
            if (selectedPrev !== selected) {
                if (selectedPrev) {
                    const selectedRow = document.getElementById(String(selectedPrev));
                    if (selectedRow) selectedRow.classList.remove('danger');
                }
                this.$model.$data.selected = selected;
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
