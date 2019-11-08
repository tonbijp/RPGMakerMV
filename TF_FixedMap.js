//========================================
// TF_FixedMap.js
// Version :0.0.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 *
 * @plugindesc マップを固定する
 * @author とんび@鳶嶋工房
 *
 * @help
 * メモにタグを書き込むと、そのマップはスクロールせず固定となります。
 * <TF_Fix:0 0>
 * 
 * TODO :
 * 固定のON/OFFするコマンド
 * 
 *
*/
(function(){'use strict';
let _isMapFixed, _FixedX, _FixedY;

/*---- Game_Player ----*/
const _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    if( _isMapFixed ) return;

    _Game_Player_updateScroll.apply( this, arguments );
}


/*---- Scene_Map ----*/
const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function(){
    _Scene_Map_onMapLoaded.call( this );

    const getMetaValue = ( object, name )=>{
        const metaTagName = 'TF_' + name;
        return object.meta.hasOwnProperty( metaTagName ) ? object.meta[ metaTagName ] : undefined;
    };

    // マップメモ固定座標の指定メタタグの処理
    // 例: <TF_fixedMap:0.84 0.2>
    _isMapFixed = false;
    const fixedMapArgs = getMetaValue( $dataMap, 'fixedMap' );
    if( fixedMapArgs === undefined ) return;

    const resultList = fixedMapArgs.match( /([0-9.]+)[ ,]([0-9.]+)/ );
    if( resultList === null || resultList.length !== 3 ) throw 'TF_fixedMap: no option';
    _FixedX = parseFloat( resultList[1] );
    _FixedY = parseFloat( resultList[2] );
    if( isNaN( _FixedX ) || isNaN( _FixedY ) ) throw 'TF_fixedMap: NaN';

    _isMapFixed = true;
}

const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call( this );
    if( _isMapFixed ){
        console.log(`${_FixedX}:${_FixedY}`);
        $gameMap.setDisplayPos( _FixedX, _FixedY );
    }
}

})();