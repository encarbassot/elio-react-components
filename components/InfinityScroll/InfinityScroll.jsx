import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./InfinityScroll.css";
import BouncingDots from "../BouncingDots/BouncingDots";
import { callApi } from "../../../api/api";
import { useDebounce } from "../../hooks";



/*
EXTERNAL FETCHING

<InfinityScroll hasMore={hasMore} loading={loading} onBottom={() => fetchData()} showFooter>
  {assignments.map((assignment, index) => (
    <AssignmentCard key={index} assignment={assignment} />
  ))}
</InfinityScroll>


INTERNAL FETCHING

<InfinityScroll 
  fetchUrl="/api/history" 
  fetchParams={{ limit: 10 }} 
  fetchMethod="GET"
  transformData={(data) => data.map(item => ({ ...item, extraField: true }))} // Optional transform
  showFooter
>
  {(assignment, index) => <AssignmentCard key={index} assignment={assignment} />}
</InfinityScroll>


*/

export default function InfinityScroll({
  children,
  className = "",
  showFooter = true,
  footerClassName = "",
  footerSlot = null,
  ref,
  
  //external fetching
  hasMore = false,
  loading = false,
  onBottom,

  //internal fetching
  fetchUrl = "",
  onFetch,
  onDataUpdate,
  fetchParams = {limit:10}, // Params for request
  fetchMethod = "POST", // HTTP method
  transformData = (data) => data, // Function to process API response
  presentData = data => data, // Function to format data into JSX
  jwt,
  childrenInsideRef = null,
  listClassname = "",
  listElementClassname = "",
}) {


  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  
  const pageRef = useRef(0)
  const totalPagesRef = useRef(1)
  const [internalHasMore, setInternalHasMore] = useState(true);
  
  const scrollRef = useRef(null)

  const isExternal = [onBottom].some(Boolean)
  const isInternal = [onFetch,listClassname,listElementClassname,fetchUrl,childrenInsideRef,jwt].some(Boolean)
  


  useImperativeHandle(ref,()=>({
    reload:()=>fetchData(1,true),
    getData:()=>data,
    setData:(newData)=>setData(newData),
  }))

  if(isExternal && isInternal){
    console.warn("InfinityScroll: You should use either onBottom or fetchUrl, not both")
  }



  useEffect(()=>{
    if(onDataUpdate){
      onDataUpdate(data)
    }
  },[data,onDataUpdate])

  /**
   * Internal fetch data for infinite scrolling
   */


  const fetchData = useDebounce(
    async (newPage,reload)=>{

      setIsFetching(true)

      const response = await callApi(fetchUrl, { ...fetchParams, page: newPage },jwt, fetchMethod);
      if (response.success) {
        
        const newData = transformData(response.data.data);
  
        if(reload){
          setData(newData)
        }else{
          setData((prev) => [...prev, ...newData]);
        }
        // setPage(response.data.page)
        pageRef.current = response.data.page
        setInternalHasMore(response.data.page < response.data.totalPages);
        totalPagesRef.current = response.data.totalPages
      }

      if(onFetch){
        onFetch(response)
      }

      setIsFetching(false)
    },
    ()=>{
      setIsFetching(true)
    },
    200
  )



  useEffect(() => {
    if (fetchUrl) fetchData(1);
  }, []);


  useEffect(() => {
    const div = scrollRef.current;
    if (!div) return;

    function handleScroll() {
      const external = !loading && hasMore
      const internal = !isFetching && internalHasMore
      const enableToLoad = (isExternal && external) || (isInternal && internal)
      if (div.scrollTop + div.clientHeight >= div.scrollHeight - 50 && enableToLoad) {
        handleLoadMore()
      }
    }

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);





  function handleLoadMore(e){
    if(e)e.preventDefault()

    if(onBottom){
      onBottom()
    }

    const totalPages = totalPagesRef.current
    const canFetch = pageRef.current+1 <= totalPages && pageRef.current+1 > pageRef.current
    console.log("CAN FETCH",canFetch,pageRef.current+1,totalPages)
    if(!(!fetchUrl || isFetching || !internalHasMore) && canFetch){
      fetchData(pageRef.current+1)
    }
  }

  return <div className={"elio-react-components InfinityScroll "+className} ref={scrollRef}>
    {!fetchUrl && children}

    {fetchUrl &&<>
      {children}
      <ul className={listClassname}>
        {data.map((item, index) => (
          <li key={index} className={listElementClassname}>{presentData(item, index)}</li>
        ))}
      </ul>
    
    
    </>}


    {footerSlot}
    {
      showFooter && onBottom &&
      <footer className={footerClassName}>
        {loading && <div className="loading">Cargando<BouncingDots/></div>}
        {!loading && hasMore && 
          <a onClick={handleLoadMore}>Cargar más</a>
        }
        {!hasMore && <div className="no-more">No hay más elementos</div>}
      </footer>
    }

    {
      showFooter && fetchUrl &&
      <footer className={footerClassName}>
        {isFetching && <div className="loading">Cargando<BouncingDots/></div>}
        {!isFetching && internalHasMore && 
          <a onClick={handleLoadMore}>Cargar más</a>
        }
        {!internalHasMore && <div className="no-more">No hay más elementos</div>}
      </footer>
    }
  </div>
}