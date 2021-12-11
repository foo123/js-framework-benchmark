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

const Row = new ModelView.View.Component('Row', `
<tr mv-id={props.id} id={props.id} class={props.selected}>
<td class="col-md-1">{props.id}</td>
<td class="col-md-4"><a mv-evt mv-on-click="SELECT">{props.label}</a></td>
<td class="col-md-1"><a mv-evt mv-on-click="REMOVE"><span class="glyphicon glyphicon-remove" aria-hidden="true"/></a></td>
<td class="col-md-6"/>
</tr>
`, {
    changed: (oldProps, newProps) => oldProps !== newProps
});

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {list: new ModelView.Model.Collection([]), selected: 0}))
    .template(`{
    view.model().get('list').mapTo(item => (<Row id={item.id.val()} props={item}/>))
}`)
    .components({
        'Row': Row
    })
    .actions({
        'RUN': function() {
            this.model().data().selected = 0;
            this.model().data().list.set(buildData(1000));
            this.model().notify('list');
        },
        'RUN_LOTS': function() {
            this.model().data().selected = 0;
            this.model().data().list.set(buildData(10000));
            this.model().notify('list');
        },
        'ADD': function() {
            this.model().data().list.concat(buildData(1000));
            this.model().notify('list');
        },
        'UPDATE': function() {
            const list = this.model().data().list, items = list.items(), l = items.length;
            for (let i = 0; i < l; i += 10) {
                list.set(i, {id: items[i].id, label: items[i].label.set(items[i].label.val()+" !!!"), selected: items[i].selected});
            }
            this.model().notify('list');
        },
        'CLEAR': function() {
            this.model().data().selected = 0;
            this.model().data().list.set([]);
            this.model().notify('list');
        },
        'SWAP_ROWS': function() {
            const list = this.model().data().list;
            if (list.items().length > 998) {
                list.swap(1, 998);
                this.model().notify('list');
            }
        },
        'REMOVE': function(evt, el) {
            const tr = el.closest('tr');
            const id = +tr.id;
            const list = this.model().data().list;
            const idx = list.items().findIndex((d) => d.id.val() === id);
            list.splice(idx, 1);
            if (id === this.model().data().selected) this.model().data().selected = 0;
            this.model().notify('list');
        },
        'SELECT': function(evt, el) {
            const selectedPrev = this.model().data().selected;
            const tr = el.closest('tr');
            const selected = +tr.id;
            const list = this.model().data().list;
            let idx, item;
            // framework idiomatically allows that the specifics of this action can be handled faster
            // realistic use with no loss of generality
            if (selectedPrev !== selected) {
                if (selectedPrev) {
                    idx = list.items().findIndex((d) => d.id.val() === selectedPrev);
                    item = list.items()[idx];
                    item.selected.set('', true);
                    //list.set(idx, {id: item.id, label: item.label, selected: item.selected.set('')});
                    const selectedRow = document.getElementById(String(selectedPrev));
                    if (selectedRow) selectedRow.classList.remove('danger');
                }
                this.model().data().selected = selected;
                idx = list.items().findIndex((d) => d.id.val() === selected);
                item = list.items()[idx];
                item.selected.set('danger', true);
                //list.set(idx, {id: item.id, label: item.label, selected: item.selected.set('danger')});
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
