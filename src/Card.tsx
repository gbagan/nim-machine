import {ParentComponent} from 'solid-js';

const Card: ParentComponent<{title: string}> = props => (
  <div class="rounded overflow-hidden shadow-lg p-4">
    <div class="font-bold text-xl mb-2">{props.title}</div>
    {props.children}
  </div>
);

export default Card