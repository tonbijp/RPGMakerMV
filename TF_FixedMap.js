//========================================
// TF_FixedMap.js
// Version :0.0.0.1
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
const PLUGIN_NAME = 'TF_fixedMap';
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
    const fixedMapArgs = getMetaValue( $dataMap, 'fixedMap' );
    if( fixedMapArgs === undefined ){
        _isMapFixed = false;
    }else{
        [ _FixedX, _FixedY ] = string2pos( fixedMapArgs );
        _isMapFixed = true;
    }
}

/**
 * 文字列の座標を数値配列にして返す。
 * @param {String} str スペース区切りの座標
 * @returns {Array<Number>} 座標 x, y の配列
 */
function string2pos( str ){
    const args = str.split( ' ' );
    if( args.length !== 2 ) throw PLUGIN_NAME + ': no option';
    const x = parseFloat( args[ 0 ] );
    const y = parseFloat( args[ 1 ] );
    if( isNaN( x ) || isNaN( y ) ) throw PLUGIN_NAME + ': NaN';
    return [ x, y ];
}

const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call( this );
    if( _isMapFixed ){
        $gameMap.setDisplayPos( _FixedX, _FixedY );
    }
}

})();