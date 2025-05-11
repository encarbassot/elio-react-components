import { useRef, useState } from "react";
import "./Table.css"
//import {} from "../../assets/"

import icoEdit from "../../assets/icons/edit.svg"
import icoTrash from "../../assets/icons/trash.svg"
import icoConfig from "../../assets/icons/config.svg"
import icoCancel from "../../assets/icons/cancel.svg"
import icoConfirm from "../../assets/icons/confirm.svg"
import icoUp from "../../assets/icons/triangleUp.svg"
import icoDown from "../../assets/icons/triangleDown.svg"

export function Table({
  elements, //mandatory
  headers,  //mandatory
  elementToArray,
  columnWidths, // always integers, that means 1 => 1fr

  //styles
  compact:isCompact = false,
  striped:isStriped = false,
  autoY = false,

  ///actions
  onDelete,
  onUpdate,
  onAccept,
  onCancel,
  onConfig,
  onClickRow,

  sortingColumn : _sortingColumn = undefined,
  sortingDirection : _sortingDirection = "ASC", // or "DESC"
}) {

  if(!elements || !headers){
    console.warn("TABLE: elements and headers are mandatory")
    return <div className="Table">No elements or headers</div>
  }

  const tableRef = useRef(null)

  const [vcolumnWidths, setColumnWidths] = useState(columnWidths ? columnWidths : Array.from({length:headers.length}).fill(1));
  const [isOnMargin,setIsOnMargin] = useState(false)

  const [sortingColumn, setSortingColumn] = useState(_sortingColumn)
  const [sortingDirection, setSortingDirection] = useState(_sortingDirection === "ASC")

  const hasActions = Boolean(onDelete) || Boolean(onUpdate) || Boolean(onAccept) || Boolean(onCancel) || Boolean(onConfig)

  if(headers.length!==columnWidths.length){
    console.warn("TABLE: columns and headers must be same length")
  }

  if (sortingColumn !== undefined && typeof sortingColumn !== "number") {
    console.warn("TABLE: sortingColumn must be a number")
  }else if (sortingColumn >= columnWidths.length || sortingColumn < 0) {
    console.warn("TABLE: sortingColumn out of range");
  }

  if (!(_sortingDirection === "ASC" || _sortingDirection === "DESC")) {
    console.warn('TABLE: sortingDirection must be "ASC" or "DESC"');
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
    const isOnRightMargin = i !== headers.length - 1 && distanceToRightMargin <= pxFromMargin;
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


  function handleAccept(elem,i){
    onAccept && onAccept(elem,i)
  }

  function handleCancel(elem,i){
    onCancel && onCancel(elem,i)
  }

  function handleUpdate(elem,i){
    onUpdate && onUpdate(elem,i)
  }

  function handleDelete(elem,i){
    onDelete && onDelete(elem,i)
  }

  function handleConfig(elem,i){
    onConfig && onConfig(elem,i)
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
  function sorter(a,b){
    if(sortingColumn === undefined){
      //pasive sorter, no sort
      return 0
    }

    const elementA = elementToArray(a)[sortingColumn]
    const elementB = elementToArray(b)[sortingColumn]

    // Check if both values are numbers, if so, compare them numerically
    const isNumberA = !isNaN(elementA);
    const isNumberB = !isNaN(elementB);

    if (isNumberA && isNumberB) {
      // If both are numbers, compare them numerically
      return sortingDirection ? elementA - elementB : elementB - elementA;
    }

    // Convert to strings and compare both elements
    const valueA = elementA ? elementA.toString() : ''; // to avoid null/undefined errors
    const valueB = elementB ? elementB.toString() : ''; // to avoid null/undefined errors

    if (sortingDirection) {
      // If sorting direction is ASC
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }

  }

  return (
    <>
      <div className={"elio-react-components Table"+(isCompact?" compact":"")+(isStriped?" striped":"")+(autoY?" autoY":"")} ref={tableRef}>
        <table>
          <thead>
            <tr>
              {headers.map((columnName,i)=>{
                const widths = widthsPercent()

                return (
                <th
                  key={i}
                  className={"Table__header "+(isOnMargin?"resize":"")}
                  onMouseDown={e => handleMouseDown(e,i)}
                  onMouseOver={e=>handleMouseOver(e,i)}
                  onClick={()=>handleChangeSortingColumn(i)}
                  style={{width:widths[i]}}
                >
                  <div className="Table__header__container">
                    <span>{columnName}</span>
                    {
                      sortingColumn === i &&
                      <img className="sortingIco" src={
                        sortingDirection ? icoDown : icoUp
                      } />
                    }
                  </div>
                </th>
              )})}

              {hasActions && <th/>}
            </tr>
          </thead>
          <tbody>
            {
              elements.sort(sorter).map((element,i)=>{
                const array = elementToArray(element,i)
                return (
                  <tr
                    key={i}
                    onClick={e=>handleOnClickRow(e,i,element)}
                  >
                      {
                        headers.map((_,j)=>{
                          const dataElement = array[j]
                          return(
                            <td
                              key={"-"+i+"-"+j}
                            >{dataElement?dataElement:undefined}</td>
                          )
                        })
                      }

                      {
                        hasActions &&<td className="Table__data__actions">
                          {onAccept && <button onClick={()=>handleAccept(element,i)}><img src={icoConfirm} /></button>}
                          {onCancel && <button onClick={()=>handleCancel(element,i)}><img src={icoCancel} /></button>}
                          {onUpdate && <button onClick={()=>handleUpdate(element,i)}><img src={icoEdit} /></button>}
                          {onDelete && <button onClick={()=>handleDelete(element,i)}><img src={icoTrash} /></button>}
                          {onConfig && <button onClick={()=>handleConfig(element,i)}><img src={icoConfig} /></button>}
                        </td>
                      }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </>
  );
}