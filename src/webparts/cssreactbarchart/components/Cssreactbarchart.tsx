import * as React from 'react';
import styles from './Cssreactbarchart.module.scss';
import { ICssreactbarchartProps } from './ICssreactbarchartProps';
import { escape } from '@microsoft/sp-lodash-subset';

import { getRandomInt, getRandomFromArray, randomDate, getRandomChance } from '../../../services/randomServices';

import { ICSSChartSeries } from './IReUsableInterfaces';

import stylesC from './cssChart.module.scss';

export interface ISimpleData {
  title: string;
  value: number;
  perc: number;
}

export function makeChartData( qty: number, label: string ) {

  let randomNums = generateVals(qty);
  let randomTitles = generateTitles( label, qty );
  const arrSum = randomNums.reduce((a,b) => a + b, 0);
  let percents = randomNums.map( v => { return (v / arrSum * 100 ) ; });
  let chartData: ICSSChartSeries = {
    title: label,
    labels: randomTitles,
    counts: randomNums,
    percents: percents,
    totalS: arrSum,
  };
  return chartData;
}


export function generateVals ( qty ) {
  let vals = [];
  for (let i = 0; i < qty ; i++) {
    vals.push (  getRandomInt(11 , 75) );
  }
  return vals;
}

export function generateTitles ( lbl: string, qty: number ) {
  let titles = [];
  for (let i = 0; i < qty ; i++) {
    //https://stackoverflow.com/a/3145054
    var chr = String.fromCharCode(65 + i);
    titles.push (  lbl + ' - ' + chr );
  }
  return titles;
}

export function sortKeysByOtherKey( obj: any, sortKey: string, order: 'asc' | 'dec', dataType: 'number' | 'string', otherKeys: string[]) {

  let sortCopy : number[] | string[] = JSON.parse(JSON.stringify(obj[sortKey]));

  let otherKeyArrays : any = {};
  otherKeys.map( m => { otherKeyArrays[m] = [] ; } );
  if ( order === 'asc' ) {
    sortCopy.sort();
  } else {
    sortCopy.sort((a, b) => { return b-a ;});
  }
  
  
  let x = 0;
  for ( let v of sortCopy) {
    let currentIndex = obj[sortKey].indexOf(v); //Get index of the first sortable value in original array
    let i = 0;
    otherKeys.map( key => {
      otherKeyArrays[key].push( obj[key][currentIndex] );
    });
    obj[sortKey][currentIndex] = null;
    x ++;
  }

  otherKeys.map( key => {
    obj[key] = otherKeyArrays[key] ;
  }); 

  return obj;

}

const chartType: 'bar' | 'other' = 'bar';
const stacked: boolean = false;
const sortStack: 'asc' | 'dec' | false = undefined;
const barValueAsPercent : boolean = false;
const height: number | string = "50px"; //This would be horizonal bar height... one horizontal layer
const barValues: 'counts' | 'sums' | 'avgs' | 'percents' = 'counts';

export default class Cssreactbarchart extends React.Component<ICssreactbarchartProps, {}> {

  public render(): React.ReactElement<ICssreactbarchartProps> {

    // Styles & Chart code for chart compliments of:  https://codepen.io/richardramsay/pen/ZKmQJv?editors=1010

    let chartData: ICSSChartSeries[] = [];

    chartData.push( makeChartData(10, 'Category') ) ;
    chartData.push( makeChartData(10, 'Item') ) ;
    chartData.push( makeChartData(10, 'Product') ) ;

    console.log('chartData Before: ', chartData );
    if ( stacked === false ) {
      //Re-sort all arrays by same key:

    }

    let stateHeight = stacked === false ? "40px" : height;

    let charts = chartData.map( cdO => {

      let cd : ICSSChartSeries = null;

      if ( stacked === false || sortStack === 'asc' || sortStack === 'dec' ) {
        let sortOrder : 'asc' | 'dec' = stacked === false || sortStack === 'dec' ? 'dec' : 'asc';
        cd = sortKeysByOtherKey( cdO, barValues, sortOrder, 'number', ['labels',barValues,'percents'] );
      } else {
        cd = cdO;
      }

      console.log('chartData after: cd', cd );

      let thisChart : any[] = [];
      let maxNumber: number = Math.max( ...cd[barValues] );  //Need to use ... spread in math operators:  https://stackoverflow.com/a/1669222
      for ( let i in cd[barValues] ){

        let blockStyle : any = { height: stateHeight , width: ( cd.percents[i] ) + '%'};
        let valueStyle : any = {};
        let barLabel = barValueAsPercent === true ? ( cd.percents[i].toFixed(1) ) + '%' : cd[barValues][i];
        if ( stacked === false ) { 
          let barPercent = ( cd[barValues][i] / maxNumber ) * 100;
          blockStyle.float = 'none' ;
          blockStyle.width = barPercent + '%';
          barLabel += ' - ' + cd.labels[i];
          blockStyle.whiteSpace = 'nowrap';

          if ( barPercent < 50 ) {
            blockStyle.overflow = 'visible';
            let leftValue = barPercent < 1 ? '200px' : 140 + ( 50 - barPercent ) * 20 / barPercent  + '%'; 
            valueStyle.left = leftValue;
            blockStyle.color = 'black';
          }

        }

        thisChart.push(
          <span className={ [stylesC.block, stylesC.innerShadow].join(' ') } style={ blockStyle } title={ cd.labels[i] } >
              <span className={ stylesC.value } style={ valueStyle } >{ barLabel }</span>
          </span>
        ) ;
      }

      let chartStyles : any = { lineHeight: stateHeight };
      let rowStyles : any = stacked === false ? { maxWidth: '450px' } : {};

      return <div className={ stylesC.row } style={ rowStyles }>
          <h6 style={ chartStyles }>{ cd.title }</h6>
          <div className={ stylesC.chart } >
            { thisChart }
          </div>
        </div>;

    });

    return (
      <div className={ styles.cssreactbarchart }>
        <div className={ styles.container }>
          <figure className={ stylesC.cssChart }>
            <div className={ stylesC.yAxis } >
              <h3>Chart Title</h3>
            </div>
            <div className={ stylesC.graphic } >
              { charts }
            </div>
          </figure>
        </div>
      </div>
    );
  }

  /**   This is the legend code:
   *        <div className={ stylesC.xAxis } >
              <h3>X-Axis Title</h3>
              <ul className={ stylesC.legend } >
                <li>Category A</li>
                <li>Category B</li>
                <li>Category C</li>
                <li>Category D</li>
                <li>Category E</li>
                <li>Category F</li>
              </ul>
            </div>
   */


}


/**
 * 
 *              <div className={ stylesC.row } >
                <h6>Bar Two</h6>
                <div className={ stylesC.chart } >
                  <span className={ stylesC.block} title={ "Category A" } >
                      <span className={ stylesC.value } >29%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category B" } >
                      <span className={ stylesC.value } >21%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category C" } >
                      <span className={ stylesC.value } >19%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category D" } >
                      <span className={ stylesC.value } >6%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category E" } >
                      <span className={ stylesC.value } >19%</span>
                  </span>
                  <span className={ stylesC.block} title={ "Category F" } >
                      <span className={ stylesC.value } >6%</span>
                  </span>
                </div>
              </div>


 */