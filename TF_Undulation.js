//========================================
// TF_Undulation.js
// Version :0.0.0.2
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/**
 * 
 */
/*:ja
 * @plugindesc 階段など高さの違う箇所を自然に歩く
 * @author とんび@鳶嶋工房
 * 
 * 
 * @param TerrainTag45
 * @desc 45°地形タグ
 * このタグをつけたタイルに通行設定(4方向)をして詳細な設定を行う。
 * @type number
 * @min 0
 * @max 7
 * @default 1
 * 
 * 
 * 
 * @help
 * 地形番号と通行設定(4方向)の組み合わせで坂を指定します。
 * 左右(←・→)に入力しておくだけで、自動で上下方向にも移動します。
 * 坂道や階段の上り下りの操作を自然にします。
 * 
 * 1. 地形タグで坂の角度を指定(0の場合は機能OFF)
 *      27°勾配 →→↑横2:縦1(デフォルト : 0)
 *      45°勾配 →↑横1:縦1(デフォルト : 1)
 *      63°勾配 →↑↑横1:縦2(デフォルト : 0)
 * 
 * 2. A5BCDEタイルに地形番号(デフォルト : 1)を指定したあと、通行設定(4方向)
 * ↑■■■ : 北へ移動可
 * ■■■↓ : 南へ移動可
 * ↑■■↓ : 全体が階段(南北移動可)
 * ・■■・ : 全体が階段(南北移動不可)
 * ■・←■ : 東側が高い(／)
 * ■→・■ : 西側が高い(＼)
 * ■→←■ :頂上?
 * ■・・■ :谷?
 *      0x0 ↑→←↓ : 高さレベル1(規定値:8px)
 *      0x1 ↑→←・ : 高さレベル2(規定値:16px)
 *      0x2 ↑→・↓ : 全面＼
 *      0x3 ↑→・・ : 北側＼
 *      0x4 ↑・←↓ : 全面／
 *      0x5 ↑・←・ : 北側／
 *      0x6 ↑・・↓ : 高さレベル3(規定値:24px)
 *      0x7 ↑・・・ : 未設定
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : 南側＼
 *      0xB ・→・・ : 南北＼
 *      0xC ・・←↓ : 南側／
 *      0xD ・・←・ : 南北／
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag45';

//坂の角度
/*
奥・手前と27には左側・右側、63には下側・上側が必要。
…多すぎる。
まずは45だけ作るか?
TF_LayeredMapと組み合わせられるようにするか?
63上側は二階とするか
影はどうする?
ベッドやなんかは?
方向の指定で左右方向を

地形タグ+方向設定で16バリエーションが出せる。
茂み・梯子・カウンターを加えればさらに複雑な設定が可能。
マップ作るとき面倒だけどリージョンIDで代替できるようにしておくか?

処理的には、飛行船やジャンプに似てるからその辺の処理の応用でできる?
*/


/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( PLUGIN_NAME );


let _TerrainTag = 1;    // 地形タグ規定値

if( pluginParams[ TERRAIN_TAG ] ){
    _TerrainTag = parseInt( pluginParams[ TERRAIN_TAG ], 10 );
} 

// SNは南北、LRは左右上がり
const MASK_UNDULATION = 0x001F; // 地形タグ、高層[☆]、通行設定を取り出すマスク
const FLAG_BUMP1 = 0x0;
const FLAG_BUMP2 = 0x1;
const FLAG_BUMP3 = 0x6;
const FLAG_NL45 = 0x2;
const FLAG_NR45 = 0x4;


/*---- Game_CharacterBase ----*/

Game_CharacterBase.prototype.screenY = function() {
    var th = $gameMap.tileHeight();
    const shiftY = this.shiftY();
    //if( this._characterName === '$Masha')console.log(`_realX: ${this._realX} shiftY: ${shiftY}`);
    return Math.round(this.scrolledY() * th + th - shiftY - this.jumpHeight());
};

/**
 * 移動から停止・停止から移動に切り替わったタイミングを調べる。
 */
const _Game_CharacterBase_updateMove = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
    const preRealX = this._realX;
    if( this._realX != this.x && this.chaseCharacter === undefined ){
        //移動中
        const undulationType = checkUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulationType !== -1 ){
            const ratioXY = ( this.x < preRealX )? FLAG2RATIOL[ undulationType ] : FLAG2RATIOR[ undulationType ];
            if( ratioXY ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }
    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x ) return; // 止まってる
    if( this.chaseCharacter ) return; // follower
 
    const undulationType = checkUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulationType === -1 ) return;

    if( this._realX === this.x ){
        // 停止
        if( this.x < preRealX ){
            // 左向き
        }else{
            //右向き
        }

    }else if( ( preRealX * 2 ) === Math.floor( preRealX * 2 ) ){
        //動き始め
        const dY = ( this.x < preRealX )? FLAG2POSL[ undulationType ] : FLAG2POSR[ undulationType ];
        if( dY ){
            this._y = $gameMap.roundY( this._y + dY );
            this._realY = this._y - dY;
        }
    }
}

// 移動速度の調整比率
const FLAG2RATIOL = {};//左向き
FLAG2RATIOL[ FLAG_NL45 ] = [ 0.2, 0.2 ]; // ↖︎
FLAG2RATIOL[ FLAG_NR45 ] = [ 0.2, -0.2 ]; // ↙︎
const FLAG2RATIOR = {};//右向き
FLAG2RATIOR[ FLAG_NL45 ] = [ -0.2, -0.2 ]; // ↘︎
FLAG2RATIOR[ FLAG_NR45 ] = [ -0.2, 0.2 ]; // ↗︎

// 到達点の位置
const FLAG2POSL= {};//左向き
FLAG2POSL[ FLAG_NL45 ] = -0.5;
FLAG2POSL[ FLAG_NR45 ] = 0.5;
const FLAG2POSR= {};//右向き
FLAG2POSR[ FLAG_NL45 ] = 0.5;
FLAG2POSR[ FLAG_NR45 ] = -0.5;

/**
 * 縦にずらすピクセル数を返す
 */
const _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
Game_CharacterBase.prototype.shiftY = function(){
    const shiftY = _Game_CharacterBase_shiftY.call( this );
    let tileX = getTileX( this._realX );
    const x = Math.floor( this._realX + 0.5 );
    const y = Math.floor( this._realY + 0.5 );
    const undulationTypeL = ( tileX === 0 )? checkUndulationType( $gameMap.roundX( x - 1 ), y ) : -1;
    const undulationTypeR = checkUndulationType( x, y );
    if( -1 === undulationTypeL && -1 === undulationTypeR ) return shiftY;

    /**
     * 段差指定フラグに応じた段差を返す
     * @param {Number} undulationType 段差指定フラグ
     * @returns {Number} 段差(ピクセル)
     */
    const getUndulation = ( undulationType )=>{
        if( undulationType === -1 ) return 0;
        const bump = FLAG2BUMP[ undulationType ];
        if( bump ) return bump;
        return 0;
    }

    const dYR = getUndulation( undulationTypeR );
    const dYL = getUndulation( undulationTypeL );
    return shiftY + Math.max( dYL, dYR);
}
const FLAG2BUMP= {}; // 段差
FLAG2BUMP[ FLAG_BUMP1 ] = 8;
FLAG2BUMP[ FLAG_BUMP2 ] = 16;
FLAG2BUMP[ FLAG_BUMP3 ] = 24;

/**
 * 指定位置に高低差flagがあれば返す
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} undulationType 調べるタイルのflag
 * @returns {Boolean} 見つかったflag、見つからない場合は-1
 */
function checkUndulationType( x, y ){
    const flags = $gameMap.tilesetFlags();
    const tiles = $gameMap.allTiles( x, y );
    
    for ( let i = 0; i < tiles.length; i++ ){
        const flag = flags[ tiles[ i ] ];
        if ( ( flag  >> 12 ) === _TerrainTag ) return flag & MASK_UNDULATION;
    }    
    return -1;
}

/**
 * タイル幅での割合を表す0〜1(未満)の値を返す
 * @param {Number} realX 小数点以下を含むX座標(タイル数)
 * @return {Number} 0以上、1未満の数字
 */
function getTileX( realX ){
    return parseFloat( "0." + ( String( realX + 0.5 ) ).split( "." )[ 1 ] );
}

/*---- Game_Map ----*/
/**
 * 指定位置の指定フラグビットが通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} bit {@link RPG.Tileset}の flagsチェック用ビット
 * @returns {Boolean} 
 */
const _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function( x, y, bit ){

    // 高低差判定がある場合、通常の判定は無視
    if( this.terrainTag( x, y ) === _TerrainTag ) return true;

    return _Game_Map_checkPassage.call( this, x, y, bit );
};

})();
