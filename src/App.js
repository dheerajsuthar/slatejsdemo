/** @jsx jsx */
import { Editor } from 'slate-react'
import { Value } from 'slate'

import React from 'react'
import ReactDOM from 'react-dom'
import initialValue from './value.json'
import { css, jsx } from '@emotion/core'
import styled from '@emotion/styled'

/**
 * Entity node.
 */
const EntityNode = styled.span`
  background-color: yellow;
`;

/**
 * Give the menu some styles.
 *
 * @type {Component}
 */

const StyledMenu = styled.div`
  color: #fff;
  display: inline-block;
  margin-left: 15px;
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  transition: opacity 0.75s;
`;

/**
 * The hovering menu.
 *
 * @type {Component}
 */

class HoverMenu extends React.Component {
    /**
     * Render.
     *
     * @return {Element}
     */

    render() {
        const { className, innerRef } = this.props;
        const root = window.document.getElementById('root');
        console.log('selectedText', this.props.selectedText);

        return ReactDOM.createPortal(
            <StyledMenu className={className} innerRef={innerRef}>
                <div>
                    <strong>Selected text: </strong>
                    {this.props.selectedText}
                </div>
                <button onMouseDown={this.onClickHandler}>Mark Entity</button>
            </StyledMenu>,
            root
        );
    }

    onClickHandler = (event) => {
        const { editor } = this.props.editor;
        const isEntity = editor.value.blocks.some((block) => block.type === 'entity');
        event.preventDefault();
        editor.toggleMark('entity');
    }
}

/**
 * The hovering menu example.
 *
 * @type {Component}
 */

class AnnotationEditor extends React.Component {
    /**
     * Deserialize the raw initial value.
     *
     * @type {Object}
     */

    state = {
        value: Value.fromJSON(initialValue),
    }

    /**
     * On update, update the menu.
     */

    componentDidMount = () => {
        this.updateMenu();
    }

    componentDidUpdate = () => {
        this.updateMenu();
    }

    /**
     * Update the menu's absolute position.
     */

    updateMenu = () => {
        const menu = this.menu;
        if (!menu) return;

        const { value } = this.state;
        const { fragment, selection } = value;

        if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
            menu.removeAttribute('style');
            return;
        }

        const native = window.getSelection();
        const range = native.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        menu.style.opacity = 1;
        menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`;
        menu.style.left = `${rect.left
            + window.pageXOffset
            - menu.offsetWidth / 2
            + rect.width / 2}px`;
    }

    /**
     * Render.
     *
     * @return {Element}
     */

    render() {
        return (
            <div>
                <Editor
                    placeholder="Enter some text..."
                    value={this.state.value}
                    onChange={this.onChange}
                    renderEditor={this.renderEditor}
                    renderMark={this.renderMark}
                    css={css`
                        margin-top: 50px;
                    `}
                />
            </div>
        );
    }

    /**
     * Render the editor.
     *
     * @param {Object} props
     * @param {Function} next
     * @return {Element}
     */

    renderEditor = (props, editor, next) => {
        const children = next();
        return (
            <React.Fragment>
                {children}
                <HoverMenu
                    selectedText={this.state.value.fragment.text}
                    innerRef={(menu) => { this.menu = menu; }}
                    editor={editor}
                />
            </React.Fragment>
        );
    }

    /**
     * Render a Slate mark.
     *
     * @param {Object} props
     * @param {Editor} editor
     * @param {Function} next
     * @return {Element}
     */

    renderMark = (props, editor, next) => {
        const { children, mark, attributes } = props;
        switch (props.mark.type) {
            case 'entity':
                return <EntityNode {...props}>{children}</EntityNode>;
            default:
                return next();
        }
    }

    /**
     * On change.
     *
     * @param {Editor} editor
     */

    onChange = ({ value }) => {
        console.log(value);
        this.setState({ value });
    }
}


class App extends React.Component {
  state = { value: initialValue }
  render() {
    return (
      <div>
        <AnnotationEditor ></AnnotationEditor>
      </div>
    );
  }
}

export default App;
