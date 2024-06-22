import React from 'react';

const CustomToolbar = () => (
  <div id="toolbar" className="fixed top-0 left-45 right-45 bg-white bg-opacity-20 backdrop-blur-sm p-2 shadow z-50 flex justify-center rounded-2xl rounded-tr rounded-tl">
    <div className="flex flex-wrap items-center justify-center gap-2 m-4">
      <select className="ql-font" />
      <select className="ql-header">
        <option value="1" />
        <option value="2" />
        <option value="3" />
        <option value="4" />
        <option value="5" />
        <option value="6" />
        <option selected />
      </select>
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-strike" />
      <button className="ql-blockquote" />
      <button className="ql-code-block" />
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
      <button className="ql-script" value="sub" />
      <button className="ql-script" value="super" />
      <button className="ql-indent" value="-1" />
      <button className="ql-indent" value="+1" />
      <button className="ql-direction" value="rtl" />
      <select className="ql-size">
        <option value="small" />
        <option selected />
        <option value="large" />
        <option value="huge" />
      </select>
      <select className="ql-color" />
      <select className="ql-background" />
      <select className="ql-align" />
      <button className="ql-clean" />
    </div>
  </div>
);

export default CustomToolbar;
