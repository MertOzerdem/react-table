import styles from './Table.module.css';
import {tableData} from './dummyData';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useSpring, animated } from "react-spring";

const Cell = (props) => {
    const {className, children, ...rest} = props;

    return (
        <div className={props.className} {...rest}>
            {props.children}
        </div>
    )
}

const Table = (props) => {
    const style = useSpring({
        from: { opacity: 0,  x: -200 },
        to: { opacity: 1, x: 0 },
        config: { friction: 10, tension: 30 },
    });
    const sortStyle = useSpring({
        to: {rotateZ: -90},
        config: { friction: 10, tension: 20 },
    });


    const columnHeaders = Object.keys(tableData[0]);
    const [data, setData] = useState(tableData);
    let sortList = {};

    columnHeaders.forEach(header => {
        return sortList[header] = 'asc'
    })

    const [currentSort, setCurrentSort] = useState(sortList);

    const sortHandler = (sortTarget) => {
        setCurrentSort(({[sortTarget]: val, ...rest}) => {
            return {
                [sortTarget]: val === 'asc' ? 'desc' : 'asc',
                ...rest,
            }
        })
    }
    
    const getSortList = () => {
        let headers = []
        let sortType = []

        for (const [key, value] of Object.entries(currentSort)) {
            headers.push(key)
            sortType.push(value)
        }

        return [headers, sortType]
    }

    const sortData = () => {
        const [headers, sortType] = getSortList()
        const newData = _.orderBy(data, headers, sortType)
        setData(newData);
    }
    
    const handleSort = (sortTarget) => {
        sortHandler(sortTarget)
    }

    useEffect(() => {
        sortData()
    }, [currentSort])

    return (
        <animated.div className={styles['table-wrapper']} style={style}>
            <table className={styles.table}>
                <tbody className={styles['table-body']}>
                    <tr className={styles.row} >
                        {columnHeaders.map((header, key) => {
                            return (
                                <td key={key} className={styles['row-item']} onClick={() => handleSort(header)}>{header}
                                    <div className={styles.sort}>{currentSort[header] === 'asc' ? '<' : '>'}</div>
                                </td>
                            )
                        })}
                    </tr>

                    {data.map((cell) => {
                        return (
                            <tr key={cell.id} className={styles.row}>
                                {columnHeaders.map((header, key) => {
                                    return (
                                        <Cell key={key} className={`${styles['row-item']} ${styles['line-count-5']}`} item={cell}>{cell[header]}</Cell>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </animated.div>
    )
}

export default Table;