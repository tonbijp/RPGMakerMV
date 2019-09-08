//========================================
// TF_Undulation.js
// Version :0.7.7.0
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
 * @param TerrainTag
 * @desc この地形タグ+通行設定(4方向)で詳細な段差設定を行う。
 * @type number
 * @min 1
 * @max 7
 * @default 1
 * 
 * @help
 * 注意 : トリアコンタンさんの HalfMove.js の利用を前提としています。
 * TF_Undulation.js の前に HalfMove.js を配置するようにしてください。
 * 
 * 地形タグと通行設定(4方向)の組み合わせで坂・階段を指定します。
 * 左右(←・→)に入力しておくだけで、自動で上下方向にも移動します。
 * 同じ設定のタイルを敷き詰めると、それっぽく衝突判定を行います。
 * 
 * 1. A5BCDEタイルに地形タグ(デフォルト : 1)を指定
 * 
 * 2. 通行設定(4方向)によって、詳細設定
 *      0x0 ↑→←↓ : 段差レベル1(規定値:6px)
 *      0x1 ↑→←・ : 段差レベル2(規定値:12px)
 *      0x2 ↑→・↓ : \  63°
 *      0x3 ↑→・・ : ＼ 27° 南より
 *      0x4 ↑・←↓ :  / 63°
 *      0x5 ↑・←・ : ／ 27° 南より
 *      0x6 ↑・・↓ : 段差レベル3(規定値:18px)
 *      0x7 ↑・・・ : 段差レベル4(規定値:24px)
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : ＼ 27° 北より
 *      0xB ・→・・ : ＼ 45°
 *      0xC ・・←↓ : ／ 27° 北より
 *      0xD ・・←・ : ／ 45°
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag';

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
// 段差設定フラグ
const BUMP1 = 0x0;
const BUMP2 = 0x1;
const BUMP3 = 0x6;
const BUMP4 = 0x7;
// 傾き設定フラグ
const W45 = 0xB;
const E45 = 0xD;
const W63 = 0x2;
const E63 = 0x4;
const W27N = 0xA;
const W27S = 0x3;
const E27N = 0xC;
const E27S = 0x5;


// フラグから移動速度の調整比率を得る
const FLAG2RATIO_W = {}; // 西(左)向き←
FLAG2RATIO_W[ W45 ] = [ 0.2, 0.2 ]; // ↖︎
FLAG2RATIO_W[ E45 ] = [ 0.2, -0.2 ]; // ↙︎
FLAG2RATIO_W[ W63 ] = [ 0.6, 0.2 ]; // ↖︎
FLAG2RATIO_W[ E63 ] = [ 0.6, -0.2 ]; //  ↙︎
FLAG2RATIO_W[ W27N ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ E27N ] = [ 0.2, -0.6 ]; // ↙︎
FLAG2RATIO_W[ W27S ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ E27S ] = [ 0.2, -0.6 ]; // ↙︎
const FLAG2RATIO_E = {}; // 東(右)向き→
FLAG2RATIO_E[ W45 ] = [ -0.2, -0.2 ]; // ↘︎
FLAG2RATIO_E[ E45 ] = [ -0.2, 0.2 ]; // ↗︎
FLAG2RATIO_E[ W63 ] = [ -0.6, -0.2 ]; // ↘︎
FLAG2RATIO_E[ E63 ] = [ -0.6, 0.2 ]; // ↗︎
FLAG2RATIO_E[ W27N ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ E27N ] = [ -0.2, 0.6 ]; // ↗︎
FLAG2RATIO_E[ W27S ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ E27S ] = [ -0.2, 0.6 ]; // ↗︎

// フラグから階段(坂)の到達点の位置を得る
const FLAG2POS_W= {}; // 西(左)向き←
FLAG2POS_W[ W45 ] = [ 0, -0.5];
FLAG2POS_W[ E45 ] = [ 0, 0.5];
FLAG2POS_W[ W63 ] = [ 0, -1];
FLAG2POS_W[ E63 ] = [ 0, 1];
FLAG2POS_W[ W27N ] = [ -0.5, -0.5];
FLAG2POS_W[ E27N ] = [ -0.5, 0.5];
FLAG2POS_W[ W27S ] = [ -0.5, -0.5];
FLAG2POS_W[ E27S ] = [ -0.5, 0.5];
const FLAG2POS_E= {}; // 東(右)向き→
FLAG2POS_E[ W45 ] = [ 0, 0.5];
FLAG2POS_E[ E45 ] = [ 0, -0.5];
FLAG2POS_E[ W63 ] = [ 0, 1];
FLAG2POS_E[ E63 ] = [ 0, -1];
FLAG2POS_E[ W27N ] = [ 0.5, 0.5];
FLAG2POS_E[ E27N ] = [ 0.5, -0.5];
FLAG2POS_E[ W27S ] = [ 0.5, 0.5];
FLAG2POS_E[ E27S ] = [ 0.5, -0.5];


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
    const isJustX = ( this._realX % 1 ) === 0;
    const isJustY = ( this._realY % 1 ) === 0;
    const halfPos = ( isJustX ? 1 : 0 ) + ( isJustY ? 2 : 0 );  // タイル内の位置( 0:左上, 1:上, 2:左下, 3:下 )

    // 高低差タイプ(テンキー対応)
    const undulation1 = getUndulation( intX - 1, intY + 1 );  // 南西↙
    const undulation2 = getUndulation( intX,        intY + 1 ); // 南↓
    const undulation3 = getUndulation( intX + 1, intY + 1 ); // 南東↘
    const undulation4 = getUndulation( intX - 1, intY        ); // 西←
    const undulation5 = getUndulation( intX,        intY        ); // 現在地
    const undulation6 = getUndulation( intX + 1, intY        ); // 東→
    const undulation7 = getUndulation( intX - 1, intY - 1 );  // 北西↖
    const undulation8 = getUndulation( intX,        intY - 1 ); // 北↑
    const undulation9 = getUndulation( intX + 1, intY - 1 ); // 北東 ↗︎

    const isW27 = ( undulation )=>{
        return undulation === W27N ||  undulation === W27S;
    };
    const isSameW27SN = ( dy )=>{
        return isW27( undulation5 ) && isW27( getUndulation( intX, intY + dy ) );
    };
    const isE27 = ( undulation )=>{
        return undulation === E27N ||  undulation === E27S;
    };
    const isSameE27SN = ( dy )=>{
        return isE27( undulation5 ) && isE27( getUndulation( intX, intY + dy ) );
    };

    // 上下方向のレイアウト
    const LAYOUT_NONE = 0;
    const LAYOUT_SINGLE = 1;
    const LAYOUT_NORTH = 8;
    const LAYOUT_CENTER = 5;
    const LAYOUT_SOUTH = 2;
    /**
     * 指定方向+南北の地形を返す。
     * @param {Number} d 向き(テンキー対応)
     * @returns {Array} 配置の種類
     */
    const getTileNCS = ( d )=>{
        switch( d ){
            case 1:
                return [ undulation4, undulation1, getUndulation( intX - 1, intY + 2 ) ];
            case 2:
                return [ undulation5, undulation2, getUndulation( intX, intY + 2 ) ];
            case 3:
                return [ undulation6, undulation3, getUndulation( intX + 1, intY + 2 ) ];
            case 4:
                return [ undulation7, undulation4, undulation1 ];
            case 5:
                return [ undulation8, undulation5, undulation2 ];
            case 6:
                return [ undulation9, undulation6, undulation3 ];
            case 7:
                return [ getUndulation( intX - 1, intY - 2 ), undulation7, undulation4 ];
            case 8:
                return [ getUndulation( intX, intY - 2 ), undulation8, undulation5 ];
            case 9:
                return [ getUndulation( intX + 1, intY - 2 ), undulation9, undulation6 ];
        }
    }
    /**
     * 移動先の地形を調べて配置タイプを返す。
     * @param {Number} undulation 調査する高低差
     * @param {Number} d 向き(テンキー対応)
     * @returns {Number} 配置の種類( LAYOUT_NORTH, LAYOUT_CENTER, LAYOUT_SOUTH, LAYOUT_SINGLE, LAYOUT_NONE )
     */
    const getTileLayout = ( undulation, d )=>{
        const [ tileN, tileC, tileS ] = getTileNCS( d );
        if( tileC !== undulation ) return LAYOUT_NONE;
        if( tileN === undulation ){
            return ( tileS === undulation ) ? LAYOUT_CENTER : LAYOUT_SOUTH;
        }else{
            return ( tileS === undulation ) ? LAYOUT_NORTH : LAYOUT_SINGLE;
        }
    };
    const isTileLayoutNorth = ( undulation, d )=>{
        return isLayoutNorth( getTileLayout( undulation, d ) );
    }
    const isTileLayoutSouth = ( undulation, d )=>{
        return isLayoutSouth( getTileLayout( undulation, d ) );
    }

   const isLayoutNorth = ( layout )=>{
        return layout === LAYOUT_NORTH || layout === LAYOUT_SINGLE;
    }
    const isLayoutSouth = ( layout )=>{
        return layout === LAYOUT_SOUTH || layout === LAYOUT_SINGLE;
    }


    /**
    * 移動先の地形を調べて配置タイプを返す。W27版。
    * @param {Number} undulation 調査する高低差
     * @param {Number} d 向き(テンキー対応)
    * @returns {Number} 配置の種類( LAYOUT_NORTH, LAYOUT_CENTER, LAYOUT_SOUTH, LAYOUT_SINGLE, LAYOUT_NONE )
    */
    const getTileLayoutW27 = ( undulation, d )=>{
        const [ tileN, tileC, tileS ] = getTileNCS( d );
        if( tileC !== undulation ) return LAYOUT_NONE;
        if( isW27( tileN ) ){
            return isW27( tileS ) ? LAYOUT_CENTER : LAYOUT_SOUTH;
        }else{
            return isW27( tileS ) ? LAYOUT_NORTH : LAYOUT_SINGLE;
        }
    };
    const isTileLayoutNorthW27 = ( undulation, d )=>{
        return isLayoutNorth( getTileLayoutW27( undulation, d ) );
    }
    const isTileLayoutSouthW27 = ( undulation, d )=>{
        return isLayoutSouth( getTileLayoutW27( undulation, d ) );
    }

    /**
    * 移動先の地形を調べて配置タイプを返す。E27版。
    * @param {Number} undulation 調査する高低差
     * @param {Number} d 向き(テンキー対応)
    * @returns {Number} 配置の種類( LAYOUT_NORTH, LAYOUT_CENTER, LAYOUT_SOUTH, LAYOUT_SINGLE, LAYOUT_NONE )
    */
    const getTileLayoutE27 = ( undulation, d )=>{
        const [ tileN, tileC, tileS ] = getTileNCS( d );
        if( tileC !== undulation ) return LAYOUT_NONE;
        if( isE27( tileN ) ){
            return isE27( tileS ) ? LAYOUT_CENTER : LAYOUT_SOUTH;
        }else{
            return isE27( tileS ) ? LAYOUT_NORTH : LAYOUT_SINGLE;
        }
    };
    const isTileLayoutNorthE27 = ( undulation, d )=>{
        return isLayoutNorth( getTileLayoutE27( undulation, d ) );
    }
    const isTileLayoutSouthE27 = ( undulation, d )=>{
        return isLayoutSouth( getTileLayoutE27( undulation, d ) );
    }

    // ＼ W27S
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouthW27( W27S, 5 ) || isTileLayoutNorthW27( W27S, 4 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthW27( W27S, 2 ) ||  isTileLayoutSouthW27( W27S, 4 ) ) return false;
            if( isTileLayoutSouthW27( W27S, 2 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorthW27( W27S, 2 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 3 ){
            if( isTileLayoutNorthW27( W27S, 4 ) ) return false;
        }
    }else if( d === 6 ){
        if( halfPos === 1 ){
            if( isTileLayoutSouthW27( W27S, 6 ) ) return true;
            if( isTileLayoutNorthW27( W27S, 6 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorthW27( W27S, 7 ) ) return false;
            if( isTileLayoutSouthW27( W27S, 4 ) ) return true;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouthW27( W27S, 8 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthW27( W27S, 5 ) ) return false;
        }
    }

    // ／ E27S
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorthE27( E27S, 5 ) ) return false;
            if( isTileLayoutSouthE27( E27S, 4 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthE27( E27S, 1 ) ) return false;
            if( isTileLayoutSouthE27( E27S, 1 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorthE27( E27S, 2 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorthE27( E27S, 4 ) ) return false;
            if( isTileLayoutSouthE27( E27S, 4 ) ) return true;
        }
    }else if( d === 6 ){
        if( halfPos === 3 ){
            if( isTileLayoutNorthE27( E27S, 6 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorthE27( E27S, 8 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthE27( E27S, 4 ) ) return false;
        }
    }


    // ＼ W27N
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouthW27( W27N, 4 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthW27( W27N, 1 ) || isTileLayoutNorthW27( W27N, 2 ) || isTileLayoutSouthW27( W27N, 2 ) ) return false;
            if( isTileLayoutSouthW27( W27N, 1 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorthW27( W27N, 2 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorthW27( W27N, 4 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouthW27( W27N, 4 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorthW27( W27N, 5 ) || isTileLayoutSouthW27( W27N, 7 ) ) return false;
            if( isTileLayoutSouthW27( W27N, 4 ) ) return true;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthW27( W27N, 4 ) ) return false;
        }
    }


    // ／ E27N
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouthE27( E27N, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthE27( E27N, 2 ) ) return false;
            if( isTileLayoutNorthE27( E27N, 1 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorthE27( E27N, 2 ) ) return false;
        }
    }else if( d === 6 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorthE27( E27N, 6 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouthE27( E27N, 6 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouthE27( E27N, 5 ) ) return true;
            if( isTileLayoutNorthE27( E27N, 4 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorthE27( E27N, 5 ) ) return false;
        }
    }

    // W27N・E27Nの下部タイル
    if( d === 8 && !isJustY ){
        if( ( undulation8 === W27N && !isW27( undulation5 ) )
          || ( undulation8 === E27N && !isE27( undulation5 ) ) ) return false;
    }

    // W27N・W27S・E27N・E27S 共通の中央部分タイル
    // TODO:この処理なくても成立しそうなので、調査して不要なら削除
    if( d === 2 || d === 8 ){
        if( isSameW27SN( 1 ) && isSameW27SN( -1 ) ) return true;
        if( isSameE27SN( 1 ) && isSameE27SN( -1 ) ) return true;
    }


    // \  W63
    if( d === 2 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorth( W63, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W63, 2 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouth( W63, 5 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorth( W63, 5 ) ) return false;
            if( isTileLayoutSouth( W63, 5 ) ) return true;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W63, 4 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouth( W63, 5 ) ) return true;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( W63, 5 ) ) return false;
            if( isTileLayoutSouth( W63, 8 ) ) return false;
        }else if( halfPos === 1 ){
            if( isTileLayoutNorth( W63, 8 ) || isTileLayoutSouth( W63, 8 ) ) return false;
        }
    }

    //  / E63
    if( d === 2 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorth( E63, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E63, 1 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouth( E63, 5 ) ) return false;
        }
    }else if( d === 6 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorth( E63, 5 ) ) return false;
            if( isTileLayoutSouth( E63, 5 ) ) return true;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E63, 5 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouth( E63, 5 ) ) return true;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( E63, 4 ) ) return false;
        }else if( halfPos === 1 ){
            if( isTileLayoutNorth( E63, 8 ) || isTileLayoutSouth( E63, 8 ) ) return false;
        }
    }

    // ＼ W45
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( W45, 4 ) ) return false;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( W45, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W45, 2 ) ) return false;
            if( isTileLayoutSouth( W45, 1 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( W45, 2 ) ) return false;
            if( isTileLayoutSouth( W45, 2 ) ) return true;
        }
    }else if( d === 4 ){
        if( halfPos === 0 ){
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( W45, 5 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( W45, 4 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( W45, 5 ) || isTileLayoutNorth( W45, 7 ) ) return false;
            if( isTileLayoutSouth( W45, 4 ) ) return true;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( W45, 5 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( W45, 5 ) ) return false;
        }
    }


    // ／ E45
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( E45, 5 ) ) return false;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( E45, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E45, 1 ) ) return false;
            if( isTileLayoutSouth( E45, 2 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( E45, 2 ) ) return false;
            if( isTileLayoutSouth( E45, 2 ) ) return true;
        }
    }else if( d === 6 ){
        if( halfPos === 0 ){
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( E45, 5 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( E45, 6 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( E45, 4 ) || isTileLayoutNorth( E45, 8 ) ) return false;
            if( isTileLayoutSouth( E45, 5 ) ) return true;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( E45, 5 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( E45, 5 ) ) return false;
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
    const tileX = ( preRealX + 0.5 ) % 1;
    const isW =  this.x < preRealX;
    if( this._realX != this.x ){ //移動中
        const undulation5 = getUndulation( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulation5 !== -1 ){

            const ratioXY = isW ? FLAG2RATIO_W[ undulation5 ] : FLAG2RATIO_E[ undulation5 ];
            if( ratioXY && !( ( undulation5 === W63 && 0.5 < tileX ) || ( undulation5 === E63 && tileX < 0.5 ) ) ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }

    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x || this._realX === this.x ) return;
 
    const undulation5 = getUndulation( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulation5 === -1 || ( preRealX * 2 ) !== Math.floor( preRealX * 2 ) ) return;

    const targetPos = isW ? FLAG2POS_W[ undulation5 ] : FLAG2POS_E[ undulation5 ];
    if( targetPos === undefined ) return;

    // 角度63の坂は半分だけ動かす
    if( undulation5 === W63 ){
        if( isW ){
            if( tileX === 0 ) return;
        } else {
            if( tileX === 0.5 ) return;
        }
    }else if( undulation5 === E63 ){
        if( isW ){
            if( tileX === 0.5 ) return;
        } else {
            if( tileX === 0 ) return;
        }
    }

    //動き始め
    this._x = $gameMap.roundX( this._x + targetPos[ 0 ] );
    //this._realX -= targetPos[ 0 ];
    this._y = $gameMap.roundY( this._y + targetPos[ 1 ] );
    this._realY = this._y - targetPos[ 1 ];
}


 // フラグから段差の量を得る
 const FLAG2BUMP= {};
 FLAG2BUMP[ BUMP1 ] = 6;
 FLAG2BUMP[ BUMP2 ] = 12;
 FLAG2BUMP[ BUMP3 ] = 18;
 FLAG2BUMP[ BUMP4 ] = 24;

/**
 * 縦にずらすピクセル数を返す
 */
const _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
Game_CharacterBase.prototype.shiftY = function(){
    const shiftY = _Game_CharacterBase_shiftY.call( this );
    let tileX = ( this._realX + 0.5 ) % 1;
    const intX = Math.floor( this._realX + 0.5 );
    const intY = Math.floor( this._realY + 0.5 );
    const undulationL = ( tileX === 0 )? getUndulation( intX - 1, intY ) : -1;
    const undulationR = getUndulation( intX, intY );
    if( -1 === undulationL && -1 === undulationR ) return shiftY;

    /**
     * 段差指定フラグに応じた段差を返す
     * @param {Number} undulation 段差指定フラグ
     * @returns {Number} 段差(ピクセル)
     */
    const getBump = ( undulation )=>{
        if( undulation === -1 ) return 0;
        const bump = FLAG2BUMP[ undulation ];
        if( bump ) return bump;
        return 0;
    }

    const dYR = getBump( undulationR );
    const dYL = getBump( undulationL );
    return shiftY + Math.max( dYL, dYR );
}


/*---- Game_Player ----*/
/**
 * 階段の上の場合、4方向移動に固定
 * @param {Number} d 向き(テンキー対応)
 */
var _Game_Player_executeMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function( d ) {
    const tmpD = [ 0, 4, 2, 6, 4, 5, 6, 4, 8, 6 ][ d ];
    const targetX =  ( tmpD === 6 ) ? $gameMap.roundX( this.x + 0.5 ) : this.x ;

    if(   FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( this.y - 1 ) ) ]
        || FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( this.y ) ) ]
        || FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( this.y + 1 ) ) ]
    ){
        this.moveStraight( tmpD );
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

    const undulation = getUndulation( x, y );
    // 高低差判定がある場合は全方向通行可
    if( FLAG2BUMP[ undulation ] ) return true;

    const undulation2 = getUndulation( x, y + 1 );
    // 下が同じタイルで繋がっている場合は通行可
    if( FLAG2RATIO_W[ undulation ] ){
        if( undulation === undulation2
            // W27N・W27S および E27S・E27Nは同じとみなす
            || ( undulation === W27N && undulation2 === W27S )
            || ( undulation === W27S && undulation2 === W27N )
            || ( undulation === E27N && undulation2 === E27S )
            || ( undulation === E27S && undulation2 === E27N )
        ) return true;
    }

    return _Game_Map_isPassable.apply( this, arguments );
};



/*---- ユーティリティ関数 ----*/
/**
 * 指定位置に高低差flagがあれば返す
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} undulation 調べるタイルのflag
 * @returns {Boolean} 見つかったflag、見つからない場合は-1
 */
function getUndulation( x, y ){
    x = Math.floor( $gameMap.roundX( x ) );
    y = Math.floor( $gameMap.roundY( y ) );
    const flags = $gameMap.tilesetFlags();
    const tiles = $gameMap.allTiles( x, y );
    
    for ( let i = 0; i < tiles.length; i++ ){
        const flag = flags[ tiles[ i ] ];
        if ( ( flag  >> 12 ) === _TerrainTag ) return flag & MASK_UNDULATION;
    }    
    return -1;
}
})();
