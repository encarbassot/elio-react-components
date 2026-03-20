import { useMemo, useRef, useState } from "react";
import "./Table.css"
//import {} from "../../assets/"

import icoEdit from "../../assets/icons/edit.svg"
import icoTrash from "../../assets/icons/trash.svg"
import icoConfig from "../../assets/icons/config.svg"
import icoCancel from "../../assets/icons/cancel.svg"
import icoConfirm from "../../assets/icons/confirm.svg"
import icoUp from "../../assets/icons/triangleUp.svg"
import icoDown from "../../assets/icons/triangleDown.svg"
import { InputText } from "../inputs/InputText/InputText";



/*

▗▄▄▄▖▗▖  ▗▖ ▗▄▖ ▗▖  ▗▖▗▄▄▖ ▗▖   ▗▄▄▄▖     ▗▄▖ ▗▄▄▄▖    ▗▖ ▗▖ ▗▄▄▖▗▄▄▄▖
▐▌    ▝▚▞▘ ▐▌ ▐▌▐▛▚▞▜▌▐▌ ▐▌▐▌   ▐▌       ▐▌ ▐▌▐▌       ▐▌ ▐▌▐▌   ▐▌   
▐▛▀▀▘  ▐▌  ▐▛▀▜▌▐▌  ▐▌▐▛▀▘ ▐▌   ▐▛▀▀▘    ▐▌ ▐▌▐▛▀▀▘    ▐▌ ▐▌ ▝▀▚▖▐▛▀▀▘
▐▙▄▄▖▗▞▘▝▚▖▐▌ ▐▌▐▌  ▐▌▐▌   ▐▙▄▄▖▐▙▄▄▖    ▝▚▄▞▘▐▌       ▝▚▄▞▘▗▄▄▞▘▐▙▄▄▖

const workspaces = [
    { name: "Workspace 1", amount: 10, status: "active",  enabled: true  },
    { name: "Workspace 2", amount: 5,  status: "inactive",enabled: false },
    { name: "Workspace 3", amount: 8,  status: "active",  enabled: true  },
  ]

  return (<>
    <div className="Page Workspaces">
      <h1>Workspaces</h1>

      <Table
        elements={workspaces}

        columns={[
          {
            label: "Name",
            width: 2,
            mode: "static",
            render: (element) => element.name,
          },
          {
            label: "Amount",
            width: 1,
            mode: "editable",
            render: (element) => element.amount,
            editor: {
              type: "InputNumber",
              onCommit: (element, value) => console.log("onCommit", element, value),
            },
          },
          {
            label: "Status",
            width: 1,
            mode: "interactive",
            render: (element) => element.status,
            onClick: (element) => console.log("toggle", element),
          },
          {
            label: "Label",
            width: 1,
            mode: "static",
            render: (element) => element.enabled ? "Yes" : "No",
          },
        ]}

        // styles
        // compact
        // striped
        // borders
        // autoY

        // sorting
        sortingColumn={0}
        sortingDirection="ASC"

        // built-in row actions
        // onAccept={(element) => console.log("onAccept", element)}
        // onCancel={(element) => console.log("onCancel", element)}
        // onUpdate={(element) => console.log("onUpdate", element)}
        // onDelete={(element) => console.log("onDelete", element)}
        // onConfig={(element) => console.log("onConfig", element)}

        // custom actions (per-row)
        customActions={(element) => [
          { icon: icoEye, callback: (el) => console.log("view", el), disabled: !element.enabled },
        ]}

        // row click
        onClickRow={(event, index, element) => console.log("onClickRow", index, element)}
      />

    </div>
  </>)
*/


export function Table({
  elements,   // mandatory
  columns,    // [{ label, width, mode, render, editor?, onClick? }]
  // Legacy props (kept for backward compatibility, use columns instead)
  headers,
  elementToArray,
  columnWidths,
  columnCallbacks,

  //styles
  compact:isCompact = false,
  striped:isStriped = false,
  borders = false,
  autoY = false,

  ///actions
  onDelete,
  onUpdate,
  onAccept,
  onCancel,
  onConfig,
  onClickRow,

  customActions = [], // [{icon: , callback: (element)=>{}}]

  sortingColumn : _sortingColumn = undefined,
  sortingDirection : _sortingDirection = "ASC", // or "DESC"
}) {

  const tableRef = useRef(null)
  const [isOnMargin, setIsOnMargin] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [sortingColumn, setSortingColumn] = useState(_sortingColumn)
  const [sortingDirection, setSortingDirection] = useState(_sortingDirection === "ASC")

  // Normalize columns from new unified API or legacy props
  const resolvedColumns = useMemo(() => {
    if (columns) return columns
    if (!headers || !elementToArray) return []
    const widths = columnWidths || Array.from({ length: headers.length }).fill(1)
    return headers.map((label, i) => {
      const cb = columnCallbacks?.[i]
      let mode = "static"
      let editor, onClick
      if (cb?.type === "InputText" || cb?.type === "InputNumber") {
        mode = "editable"
        editor = { type: cb.type, onCommit: cb.callback }
      } else if (cb?.type === "onClick") {
        mode = "interactive"
        onClick = cb.callback
      }
      return { label, width: widths[i] ?? 1, mode, render: (element, rowIndex) => elementToArray(element, rowIndex)[i], editor, onClick }
    })
  }, [columns, headers, elementToArray, columnWidths, columnCallbacks])

  const [vcolumnWidths, setColumnWidths] = useState(
    () => resolvedColumns.map(c => c.width ?? 1)
  )

  const hasActions = Boolean(onDelete) || Boolean(onUpdate) || Boolean(onAccept) || Boolean(onCancel) || Boolean(onConfig) ||
    (typeof customActions === 'function' || customActions.length > 0)

  const builtinActions = useMemo(() => [
    onAccept && { icon: icoConfirm, callback: onAccept },
    onCancel && { icon: icoCancel,  callback: onCancel },
    onUpdate && { icon: icoEdit,    callback: onUpdate },
    onDelete && { icon: icoTrash,   callback: onDelete },
    onConfig && { icon: icoConfig,  callback: onConfig },
  ].filter(Boolean), [onAccept, onCancel, onUpdate, onDelete, onConfig])

  if (!elements || resolvedColumns.length === 0) {
    console.warn("TABLE: elements and columns (or headers) are mandatory", {elements,columns})
    return <div className="Table">No elements or headers</div>
  }

  if (sortingColumn !== undefined && typeof sortingColumn !== "number") {
    console.warn("TABLE: sortingColumn must be a number")
  } else if (sortingColumn >= resolvedColumns.length || sortingColumn < 0) {
    console.warn("TABLE: sortingColumn out of range")
  }

  if (!(_sortingDirection === "ASC" || _sortingDirection === "DESC")) {
    console.warn('TABLE: sortingDirection must be "ASC" or "DESC"')
  }





  function handleOnClickRow(event,i,element){
    if(onClickRow){
      onClickRow(event,i,element)
    }
  }


  function handleMouseOver(event,i){
    const initialX = event.clientX;
    const colW = vcolumnWidths;
  
    const elementRect = event.target.getBoundingClientRect();
    const isMouseOnRight = initialX > elementRect.left + elementRect.width / 2;
  
    function recalculateMargins(clientX) {
      const distanceToLeftMargin = Math.abs(clientX - elementRect.left);
      const distanceToRightMargin = Math.abs(elementRect.right - clientX);
      const pxFromMargin = 20;
  
      const newIsOnLeftMargin = i !== 0 && distanceToLeftMargin <= pxFromMargin;
      const newIsOnRightMargin = i !== colW.length - 1 && distanceToRightMargin <= pxFromMargin;

      const isOnMargin = newIsOnLeftMargin || newIsOnRightMargin
      setIsOnMargin(isOnMargin)
    }
    
    function handleMouseMove(event) {
      recalculateMargins(event.clientX);
    }

    function handleMouseUp(){
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }


  function handleMouseDown (event, i){
    const initialX = event.clientX;
    let mouseX = 0
    const colW = vcolumnWidths

    const elementRect = event.target.getBoundingClientRect();
    const isMouseOnRight = initialX > elementRect.left + elementRect.width / 2;

    const distanceToLeftMargin = Math.abs(initialX - elementRect.left);
    const distanceToRightMargin = Math.abs(elementRect.right - initialX);

    const pxFromMargin = 20
    const isOnLeftMargin = i !== 0 && distanceToLeftMargin <= pxFromMargin;
    const isOnRightMargin = i !== resolvedColumns.length - 1 && distanceToRightMargin <= pxFromMargin;
    const isOnMargin = isOnLeftMargin || isOnRightMargin;

    const handleMouseMove = (moveEvent) => {
      if(isOnMargin){
        const deltaX = initialX-moveEvent.clientX;
        applyPercentToColumn(i,(deltaX-mouseX),isMouseOnRight,colW)
        
        if(Math.abs(deltaX-mouseX)>10){
          mouseX = deltaX
        }
      }

    };


    function handleMouseUp(){
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };



  function widthsPercent(){
    const total = vcolumnWidths.reduce((acc,v)=>acc+v)
    const result = vcolumnWidths.map(v=>(v/total*100)+"%")
    return result
  }

  function applyPercentToColumn(columnIndex,px,isMouseOnRight,originalColW){
    if(!tableRef.current) return     
    const sign = (isMouseOnRight ? -1 : 1);

    const neiIndex = columnIndex + (isMouseOnRight?1:-1)
    const colPariOgW= originalColW[columnIndex]+ originalColW[neiIndex]

    const tablepx = tableRef.current?.offsetWidth
    const percent = px/tablepx*100*sign

    const totalfr = vcolumnWidths.reduce((acc,v)=>acc+v)
    
    const frPercent = totalfr * percent / 100

    setColumnWidths(prev=>{
      const updated = [...prev]
      updated[neiIndex] = bound( updated[neiIndex] - frPercent, 0, colPariOgW )
      updated[columnIndex] = bound(updated[columnIndex] + frPercent, 0 ,colPariOgW)
      return updated
    })

  }

  function bound(v,min,max){
    return Math.min(max,Math.max(v,min))
  }


  function handleCallback(callback, element, i){
    if(typeof callback === "function"){
      callback(element, i)
    }
  }

  function handleChangeSortingColumn(n){
    if(sortingColumn === n){
      setSortingDirection(!sortingDirection)
    }else{
      setSortingColumn(n)
      setSortingDirection(true)
    }
  }


  // sorts elements depending on the column selected and the direction
  function sorter(a, b) {
    if (sortingColumn === undefined) return 0

    const elementA = resolvedColumns[sortingColumn].render(a)
    const elementB = resolvedColumns[sortingColumn].render(b)

    const isNumberA = !isNaN(elementA)
    const isNumberB = !isNaN(elementB)

    if (isNumberA && isNumberB) {
      return sortingDirection ? elementA - elementB : elementB - elementA
    }

    const valueA = elementA ? elementA.toString() : ''
    const valueB = elementB ? elementB.toString() : ''

    return sortingDirection ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
  }

  return (
    <>
      <div className={"elio-react-components Table"+(isCompact?" compact":"")+(isStriped?" striped":"")+(autoY?" autoY":"")+(borders?" borders":"")} ref={tableRef}>
        <table>
          <thead>
            <tr>
              {resolvedColumns.map((col, i) => {
                const widths = widthsPercent()
                return (
                  <th
                    key={i}
                    className={"Table__header " + (isOnMargin ? "resize" : "")}
                    onMouseDown={e => handleMouseDown(e, i)}
                    onMouseOver={e => handleMouseOver(e, i)}
                    onClick={() => handleChangeSortingColumn(i)}
                    style={{ width: widths[i] }}
                  >
                    <div className="Table__header__container">
                      <span>{col.label}</span>
                      {sortingColumn === i &&
                        <img className="sortingIco" src={sortingDirection ? icoDown : icoUp} />
                      }
                    </div>
                  </th>
                )
              })}
              {hasActions && <th/>}
            </tr>
          </thead>
          <tbody>
            {
              elements.sort(sorter).map((element, i) => (
                <tr
                  key={i}
                  onClick={e => handleOnClickRow(e, i, element)}
                >
                  {resolvedColumns.map((col, j) => {
                    const dataElement = col.render(element, i)
                    const isInputNumber = col.mode === "editable" && col.editor?.type === "InputNumber"
                    const isEditableInput = col.mode === "editable"

                    const handleSubmitEdit = async (value) => {
                      if (!col.editor?.onCommit) return
                      await col.editor.onCommit(element, value, j, i)
                      setEditingCell(null)
                    }

                    return (
                      <td key={"-" + i + "-" + j} onClick={e => {
                        if (isEditableInput && editingCell === null) {
                          e.stopPropagation()
                          setEditingCell({ row: i, col: j, value: dataElement })
                        }
                      }}>
                        {isEditableInput
                          ? (editingCell?.row === i && editingCell?.col === j
                            ? <InputText
                                value={editingCell.value}
                                onChange={e => setEditingCell({ ...editingCell, value: e.target.value })}
                                onBlur={() => handleSubmitEdit(editingCell.value)}
                                onEnter={() => handleSubmitEdit(editingCell.value)}
                                onEsc={() => setEditingCell(null)}
                                autoFocus
                                typeNumber={isInputNumber}
                                alignRight={isInputNumber}
                              />
                            : <span>{dataElement}</span>)
                          : col.mode === "interactive"
                            ? <span onClick={e => {
                                e.stopPropagation()
                                col.onClick?.(element, j, i)
                              }}>
                                {dataElement}
                              </span>
                            : dataElement
                        }
                      </td>
                    )
                  })}

                      {
                        hasActions && (() => {
                          const resolvedCustom = typeof customActions === 'function'
                            ? customActions(element)
                            : customActions

                          const allActions = [...resolvedCustom, ...builtinActions]

                          return (
                            <td className="Table__data__actions">
                              {allActions.map(({ element, icon, callback, isLoading, disabled }, k) => (
                                <button key={k} onClick={() => handleCallback(callback,element, i)} disabled={isLoading || disabled}>
                                  {isLoading ? <span className="spinner small black"/> : element || <img src={icon} />}
                                </button>
                              ))}
                            </td>
                          )
                        })()
                      }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}