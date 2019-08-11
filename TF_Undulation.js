//========================================
// TF_Undulation.js
// Version :0.0.5.0
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
 * @param TerrainTag
 * @desc この地形タグ+通行設定(4方向)で詳細な段差設定を行う。
 * @type number
 * @min 1
 * @max 7
 * @default 1
 * 
 * 
 * @help
 * 地形タグと通行設定(4方向)の組み合わせで坂を指定します。
 * 左右(←・→)に入力しておくだけで、自動で上下方向にも移動します。
 * 坂道や階段の上り下りの操作を自然にします。
 * 
 * 1. A5BCDEタイルに地形タグ(デフォルト : 1)を指定
 * 
 * 2. 通行設定(4方向)によって、詳細設定
 *      0x0 ↑→←↓ : 高さレベル1(規定値:8px)
 *      0x1 ↑→←・ : 高さレベル2(規定値:16px)
 *      0x2 ↑→・↓ : \ 63°
 *      0x3 ↑→・・ : ＼ 45°
 *      0x4 ↑・←↓ : / 63°
 *      0x5 ↑・←・ : ／ 45°
 *      0x6 ↑・・↓ : 高さレベル3(規定値:24px)
 *      0x7 ↑・・・ : 未設定
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : 未設定
 *      0xB ・→・・ :  ＼ 27°
 *      0xC ・・←↓ : 未設定
 *      0xD ・・←・ : ／ 27°
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag';

/*
まずは45だけ作る

地形タグ+方向設定で16バリエーションが出せる。
茂み・梯子・カウンターを加えればさらに複雑な設定が可能。
*/


/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( PLUGIN_NAME );


let _TerrainTag = 1;    // 地形タグ規定値

if( pluginParams[ TERRAIN_TAG ] ){
    _TerrainTag = parseInt( pluginParams[ TERRAIN_TAG ], 10 );
} 

// Wは西(左)上がり…＼ 　Eは東(右)上がり…／
const MASK_UNDULATION = 0x001F; // 地形タグ、高層[☆]、通行設定を取り出すマスク
const FLAG_BUMP1 = 0x0;
const FLAG_BUMP2 = 0x1;
const FLAG_BUMP3 = 0x6;
const FLAG_W45 = 0x3;
const FLAG_E45 = 0x5;


/*---- Game_CharacterBase ----*/
/**
 * 指定方向への移動が可能か
 * キャラクタ半分の位置が関係するものは、ここで判定。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 移動可能か
 */
const _Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
Game_CharacterBase.prototype.isMapPassable = function( x, y, d ){
    const intX = Math.floor( x + 0.5 );
    const intY = Math.floor( y + 0.5 );
    const tileX = ( this._realX + 0.5 ) - intX;
    const undulationType = getUndulationType( intX, intY );
    const isSameVerticalTile = ( dy )=>{
        return undulationType === getUndulationType( intX, $gameMap.roundY( intY + dy ) );
    };

    // FLAG_E45
    if( undulationType === FLAG_E45 ){
        if( x === intX ){    // x just
            if( y === intY ){   // y just
                if( d === 8 && !isSameVerticalTile( -1 ) ) return false;
            }else{   // y half
                if( d === 2 ){
                    if( !isSameVerticalTile( 1 ) || !isSameVerticalTile( -1 ) ) return false;
                }else if( d === 8 ||  d === 6 ){
                    if( isSameVerticalTile( -1 ) ) return true;
                }
            }

        }else{   // x half
            if( y === intY ){   // y just
                if( d === 2 ){
                    return isSameVerticalTile( -1 ) && isSameVerticalTile( 1 );
                }
            }else{
                if( d === 8 ){
                    if( isSameVerticalTile( -1 ) ){
                        return ( isSameVerticalTile( - 2 ) );
                    }
                }
            }
        }
    }
    // FLAG_E45 北東の処理
    if( d === 8 && x !== intX ){
        const leftUndulationType = getUndulationType( $gameMap.roundY( intX - 1 ), intY );
        if( leftUndulationType === FLAG_E45 
        && leftUndulationType !== getUndulationType( $gameMap.roundY( intX - 1 ), $gameMap.roundY( intY - 1 ) ) ){
            if( leftUndulationType ===  getUndulationType( $gameMap.roundY( intX - 1 ), $gameMap.roundY( intY + 1 ) )  ){
                if( y !== intY ) return false;
            }else{
                if(  y === intY ) return false;
            }
        }
    }


    // FLAG_W45
    if( undulationType === FLAG_W45 ){
        if( x === intX ){    // x just
            if( y === intY ){   // y just
                if( d === 8 && !isSameVerticalTile( -1 ) ) return false;
            }else{   // y half
                if( d === 2 ){
                    if( !isSameVerticalTile( 1 ) || !isSameVerticalTile( -1 ) ) return false;
                }else if( ( d === 8 || d === 4 ) && isSameVerticalTile( -1 ) ) return true;
            }

        }else{   // x half
            if( y === intY ){   // y just
                if( d === 2 && isSameVerticalTile( 1 ) ) return  isSameVerticalTile( 2 );
            }else if( d === 8 && !isSameVerticalTile( -1 ) ) return false;
        }
    }
    if( x !== intX && y === intY && d === 2 && getUndulationType( intX, $gameMap.roundY( intY + 1 ) ) === FLAG_W45 ) return false;
    // FLAG_W45 北東の処理
    if( x !== intX ){
        const leftUndulationType = getUndulationType( $gameMap.roundY( intX - 1 ), intY );
        if( leftUndulationType === FLAG_W45 ){
            if( d === 8 ){
                if( leftUndulationType === getUndulationType( $gameMap.roundY( intX - 1 ), $gameMap.roundY( intY - 1 ) )
                && leftUndulationType !== getUndulationType( $gameMap.roundY( intX - 1 ), $gameMap.roundY( intY - 2 ) )){
                    if( y !== intY ) return false;
                }
            }else if( d === 2 ){
                if( leftUndulationType !== getUndulationType( $gameMap.roundY( intX - 1 ), $gameMap.roundY( intY - 1 ) ) ){
                    if( y === intY ) return false;
                }
            }
        }
    }

    return _Game_CharacterBase_isMapPassable.apply( this, arguments );
}

/**
 * 移動から停止・停止から移動に切り替わったタイミングを調べる。
 */
const _Game_CharacterBase_updateMove = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
    if( this.chaseCharacter ) { // followerは除外
        _Game_CharacterBase_updateMove.call( this );
        return;
    }

    const preRealX = this._realX;
    if( this._realX != this.x ){ //移動中
        const undulationType = getUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulationType !== -1 ){
            const ratioXY = ( this.x < preRealX )? FLAG2RATIO_W[ undulationType ] : FLAG2RATIO_E[ undulationType ];
            if( ratioXY ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }
    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x || this._realX === this.x ) return;
 
    const undulationType = getUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulationType === -1 ) return;

    if( ( preRealX * 2 ) === Math.floor( preRealX * 2 ) ){
        //動き始め
        const dY = ( this.x < preRealX )? FLAG2POS_W[ undulationType ] : FLAG2POS_E[ undulationType ];
        if( dY ){
            this._y = $gameMap.roundY( this._y + dY );
            this._realY = this._y - dY;
        }
    }
}

// フラグから移動速度の調整比率を得る
const FLAG2RATIO_W = {}; // 西(左)向き←
FLAG2RATIO_W[ FLAG_W45 ] = [ 0.2, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E45 ] = [ 0.2, -0.2 ]; // ↙︎
const FLAG2RATIO_E = {}; // 東(右)向き→
FLAG2RATIO_E[ FLAG_W45 ] = [ -0.2, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E45 ] = [ -0.2, 0.2 ]; // ↗︎

// フラグから階段(坂)の到達点の位置を得る
const FLAG2POS_W= {}; // 西(左)向き←
FLAG2POS_W[ FLAG_W45 ] = -0.5;
FLAG2POS_W[ FLAG_E45 ] = 0.5;
const FLAG2POS_E= {}; // 東(右)向き→
FLAG2POS_E[ FLAG_W45 ] = 0.5;
FLAG2POS_E[ FLAG_E45 ] = -0.5;

/**
 * 縦にずらすピクセル数を返す
 */
const _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
Game_CharacterBase.prototype.shiftY = function(){
    const shiftY = _Game_CharacterBase_shiftY.call( this );
    let tileX = ( this._realX + 0.5 ) % 1;
    const intX = Math.floor( this._realX + 0.5 );
    const intY = Math.floor( this._realY + 0.5 );
    const undulationTypeL = ( tileX === 0 )? getUndulationType( $gameMap.roundX( intX - 1 ), intY ) : -1;
    const undulationTypeR = getUndulationType( intX, intY );
    if( -1 === undulationTypeL && -1 === undulationTypeR ) return shiftY;

    /**
     * 段差指定フラグに応じた段差を返す
     * @param {Number} undulationType 段差指定フラグ
     * @returns {Number} 段差(ピクセル)
     */
    const getBump = ( undulationType )=>{
        if( undulationType === -1 ) return 0;
        const bump = FLAG2BUMP[ undulationType ];
        if( bump ) return bump;
        return 0;
    }

    const dYR = getBump( undulationTypeR );
    const dYL = getBump( undulationTypeL );
    return shiftY + Math.max( dYL, dYR );
}

 // フラグから段差の量を得る
const FLAG2BUMP= {};
FLAG2BUMP[ FLAG_BUMP1 ] = 8;
FLAG2BUMP[ FLAG_BUMP2 ] = 16;
FLAG2BUMP[ FLAG_BUMP3 ] = 24;

/*---- Game_Player ----*/
/**
 * 階段の上の場合、4方向移動に固定
 * @param {Number} d 向き(テンキー対応)
 */
var _Game_Player_executeMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function( d ) {
    const targetX =  (( d - 1 ) % 3 === 0) ? $gameMap.roundX( this.x - 0.5 ) : this.x ;
    const undulationType = getUndulationType( targetX , this.y + 0.5 );

    if( FLAG2RATIO_W[undulationType] ){
        d = [ 0, 4, 2, 6, 4, 5, 6, 4, 8, 6 ][ d ];
        this.moveStraight( d );
    }else{
        _Game_Player_executeMove.apply( this, arguments );
    }
}

/*---- Game_Map ----*/
/**
 * 指定位置の指定方向が通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 
 */
const _Game_Map_isPassable = Game_Map.prototype.isPassable;
Game_Map.prototype.isPassable = function( x, y, d ){
    if( this.terrainTag( x, y ) !== _TerrainTag ) return  _Game_Map_isPassable.apply( this, arguments );

    const undulationType = getUndulationType( x, y );
    const isSameVerticalTile = ( dy )=>{
        return undulationType === getUndulationType( x, $gameMap.roundY( y + dy ) );
    };
    // 高低差判定がある場合は全方向通行可
    if( FLAG2BUMP[ undulationType ] ) return true;

    // 上が別のタイルの場合は上の通過不可
    //if( d === 8 && undulationType !== getUndulationType( intX, $gameMap.roundY( intY - 1 ) ) ) return false;

    // 下が同じタイルで繋がっている場合は通行可
    if( FLAG2RATIO_W[ undulationType ] && isSameVerticalTile( 1 ) ) return true;
    // if( d === 4 ){
    //     if( undulationType === FLAG_W45 && isSameVerticalTile(1) ) return true;
    // }else if( d === 6 ){
    //     if( undulationType === FLAG_E45 && isSameVerticalTile(1) ) return true;
    // } else if( d === 2 || d === 8 ){
    //     if( ( undulationType === FLAG_W45 || undulationType === FLAG_E45 ) && isSameVerticalTile(1) ) return true;
    // }

    return _Game_Map_isPassable.apply( this, arguments );
};



/*---- ユーティリティ関数 ----*/
/**
 * 指定位置に高低差flagがあれば返す
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} undulationType 調べるタイルのflag
 * @returns {Boolean} 見つかったflag、見つからない場合は-1
 */
function getUndulationType( x, y ){
    const flags = $gameMap.tilesetFlags();
    const tiles = $gameMap.allTiles( Math.floor( x ), Math.floor( y ) );
    
    for ( let i = 0; i < tiles.length; i++ ){
        const flag = flags[ tiles[ i ] ];
        if ( ( flag  >> 12 ) === _TerrainTag ) return flag & MASK_UNDULATION;
    }    
    return -1;
}
})();
