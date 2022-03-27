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
      id: new ModelView.Model.Value(nextId++),
      label: new ModelView.Model.Value(A[random(A.length)]+' '+C[random(C.length)]+' '+N[random(N.length)])
    };
  }
  return data;
};

const Row = new ModelView.View.Component('Row', `
<tr mv-id={data.id} id={data.id} class={selected(data)}>
<td class="col-md-1">{data.id}</td>
<td class="col-md-4"><a mv-evt mv-on-click="SELECT">{data.label}</a></td>
<td class="col-md-1"><a mv-evt mv-on-click="REMOVE"><span class="glyphicon glyphicon-remove" aria-hidden="true"/></a></td>
<td class="col-md-6"/>
</tr>
`, {
    changed: (oldData, newData) => oldData !== newData
});

const list = new ModelView.Model.Collection([]);
const notSelected = ModelView.Model.Value('', null, true).changed(false);
let selected = 0;
let selectedPrev = 0;

const Main = new ModelView.View('view')
    .model(new ModelView.Model('model', {list: list}))
    .template(`{
    view.keyed(view.model().get('list').mapTo(item => (
        <Row id={item.id.val()} data={item}/>
    )))
}`)
    .components({
        'Row': Row
    })
    .context({
        selected: (item) => {
            let id = item.id.val();
            if (selected === id)
            {
                return (new ModelView.Model.Value('danger', null, true)).changed(selected !== selectedPrev);
            }
            else if (selectedPrev === id)
            {
                return (new ModelView.Model.Value('', null, true)).changed(true);
            }
            return notSelected;
        }
    })
    .actions({
        'RUN': function() {
            selected = selectedPrev = 0;
            list.replace(buildData(1000));
            this.model().notify('list');
        },
        'RUN_LOTS': function() {
            selected = selectedPrev = 0;
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
                list.set(i, {id: items[i].id, label: items[i].label.set(items[i].label.val()+" !!!")});
            }
            this.model().notify('list');
        },
        'CLEAR': function() {
            selected = selectedPrev = 0;
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
            const idx = list.items().findIndex(item => item.id.val() === id);
            list.splice(idx, 1);
            if (id === selected) {selected = selectedPrev = 0;}
            this.model().notify('list');
        },
        'SELECT': function(evt, el) {
            const id = +el.parentNode.parentNode.id;
            const items = list.items();
            if (selected !== id) {
                let idx = items.findIndex(item => item.id.val() === id);
                let item = items[idx];
                list.set(idx, {id: item.id, label: item.label});
                selectedPrev = selected;
                selected = id;
                if (selectedPrev) {
                    idx = list.items().findIndex(item => item.id.val() === selectedPrev);
                    item = items[idx];
                    list.set(idx, {id: item.id, label: item.label});
                }
                this.on('render', () => {
                    selectedPrev = selected;
                }, true);
                this.model().notify('list');
            }
        }
    })
    .autovalidate(false)
    .autobind(false)
    .livebind(true)
    .bind(['click'], document.getElementById('main'), document.getElementById('tbody'))
    .precompile()
    .sync()
;
