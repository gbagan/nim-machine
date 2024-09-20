import {ParentComponent} from 'solid-js';

export const buttonClass = "py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200";
export const checkboxClass = "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2";
export const selectClass = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
export const inputNumberClass = "block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none";
const cardClass = "rounded overflow-hidden shadow-lg p-4";

export const Card: ParentComponent<{title: string}> = props => (
  <div class={cardClass}>
    <div class="font-bold text-xl mb-2">{props.title}</div>
    {props.children}
  </div>
);