//========================================
// TF_Undulation.js
// Version :0.9.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc Can walk tiles of different height naturally, such as stairs.
 * @author Tonbi@Tobishima-Factory
 * 
 * @param TerrainTag
 * @desc Set condition with this number of terrain tag and 4 direction setting.
 * @type number
 * @min 1
 * @max 7
 * @default 1
 * 
 * @param BaseBump
 * @desc Base unit of bump.
 * @type number
 * @min 1
 * @max 14
 * @default 6
 * 
 * @help
 * CAUTION : This plugin needs HalfMove.js made by Triacontane.
 * Set HalfMove.js before TF_Undulation.js.
 * 
 * Set movement like slope or stairs use by Terrain Tag and 4 direction setting.
 * Input only L or R (←・→) to move slope automatically.
 * If you place the same tile on the map, it will run as a unified part.
 * 
 * 1. Set Terrain Tag (Default : 1) to A5BCDE tile.
 * 
 * 2. Set 4 direction for details.
 *      0x0 ↑→←↓ : N/A
 *      0x1 ↑→←・ : N/A
 *      0x2 ↑→・↓ : \  63°
 *      0x3 ↑→・・ : ＼ 27° South Side
 *      0x4 ↑・←↓ :  / 63°
 *      0x5 ↑・←・ : ／ 27° South Side
 *      0x6 ↑・・↓ : N/A
 *      0x7 ↑・・・ : N/A
 *      0x8 ・→←↓ : N/A
 *      0x9 ・→←・ : N/A
 *      0xA ・→・↓ : ＼ 27° North Side
 *      0xB ・→・・ : ＼ 45°
 *      0xC ・・←↓ : ／ 27° NorthSide
 *      0xD ・・←・ : ／ 45°
 *      0xE ・・・↓ : N/A
 *      0xF ・・・・ : N/A
 * 
 * 3. Set Ladder and Damage floor to bump level.
 *      Ladder   Damage
 *          OFF        OFF         No Bump (Apply 4 directioin settring.Written in 2.)
 *          ON          OFF         Bump Level 1(Default:6px)
 *          OFF        ON           Bump Level 2(Default:12px)
 *          ON          ON           Bump Level 3(Default:18px)
 * 
 * Released under the MIT License.
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
 * @param BaseBump
 * @desc 段差の基本単位。
 * @type number
 * @min 1
 * @max 14
 * @default 6
 * 
 * @help
 * 注意 : トリアコンタンさんの HalfMove.js の利用を前提としています。
 * TF_Undulation.js の前に HalfMove.js を配置するようにしてください。
 * 
 * 地形タグと通行設定(4方向)の組み合わせで坂・階段を指定します。
 * 左右(←・→)に入力しておくだけで、自動で上下方向にも移動します。
 * 同じ設定のタイルを敷き詰めると、それっぽく衝突判定を行います。
 * 
 * 1. A5BCDEタイルに地形タグ(規定値 : 1)を指定
 * 
 * 2. 通行設定(4方向)によって、詳細設定
 *      0x0 ↑→←↓ : 未設定
 *      0x1 ↑→←・ : 未設定
 *      0x2 ↑→・↓ : \  63°
 *      0x3 ↑→・・ : ＼ 27° 南より
 *      0x4 ↑・←↓ :  / 63°
 *      0x5 ↑・←・ : ／ 27° 南より
 *      0x6 ↑・・↓ : 未設定
 *      0x7 ↑・・・ : 未設定
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : ＼ 27° 北より
 *      0xB ・→・・ : ＼ 45°
 *      0xC ・・←↓ : ／ 27° 北より
 *      0xD ・・←・ : ／ 45°
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 3. [梯子]と[ダメージ床] の設定で段差レベルを設定
 *      [梯子]   [ダメージ床]
 *          OFF        OFF         段差なし (2. で説明した 4方向設定が適用されます)
 *          ON          OFF         段差レベル1(規定値:6px)
 *          OFF        ON           段差レベル2(規定値:12px)
 *          ON          ON           段差レベル3(規定値:18px)
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag';
const BASE_BUMP = 'BaseBump';

/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( PLUGIN_NAME );

let _TerrainTag = 1;    // 地形タグ規定値

if( pluginParams[ TERRAIN_TAG ] ){
    _TerrainTag = parseInt( pluginParams[ TERRAIN_TAG ], 10 );
} 

let _BaseBump = 6;    // 地形タグ規定値

if( pluginParams[ BASE_BUMP ] ){
    _BaseBump = parseInt( pluginParams[ BASE_BUMP ], 10 );
} 

// flag用定数
const MASK_BUMP = 0x120; // 段差用マスク(梯子とダメージ床)
// 段差設定フラグ
const BUMP1 = 0x20;
const BUMP2 = 0x100;
const BUMP3 = 0x120;

// Wは西(左)上がり…＼ 　Eは東(右)上がり…／
const MASK_UNDULATION = 0x001F; // 通行設定を取り出すマスク
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
const FLAG2RATIO_W = { // 西(左)向き ↖ , ↙
    [ W45 ] : [ 0.2, 0.2 ], [ E45 ] : [ 0.2, -0.2 ],
    [ W63 ] : [ 0.6, 0.2 ], [ E63 ] : [ 0.6, -0.2 ],
    [ W27N ] : [ 0.2, 0.6 ], [ E27N ] : [ 0.2, -0.6 ],
    [ W27S ] : [ 0.2, 0.6 ], [ E27S ] : [ 0.2, -0.6 ],
};
const FLAG2RATIO_E = { // 東(右)向き ↘ , ↗
    [ W45 ] : [ -0.2, -0.2 ], [ E45 ] : [ -0.2, 0.2 ],
    [ W63 ] : [ -0.6, -0.2 ], [ E63 ] : [ -0.6, 0.2 ],
    [ W27N ] : [ -0.2, -0.6 ], [ E27N ] : [ -0.2, 0.6 ],
    [ W27S ] : [ -0.2, -0.6 ], [ E27S ] : [ -0.2, 0.6 ],
};

// フラグから階段(坂)の到達点の位置を得る
const FLAG2POS_W= { // 西(左)向き ↖ , ↙
    [ W45 ] : [ 0, -0.5], [ E45 ] : [ 0, 0.5],
    [ W63 ] : [ 0, -1], [ E63 ] : [ 0, 1],
    [ W27N ] : [ -0.5, -0.5], [ E27N ] : [ -0.5, 0.5],
    [ W27S ] : [ -0.5, -0.5], [ E27S ] : [ -0.5, 0.5],
};
const FLAG2POS_E= { // 東(右)向き ↘ , ↗
    [ W45 ] : [ 0, 0.5], [ E45 ] : [ 0, -0.5],
    [ W63 ] : [ 0, 1],  [ E63 ] : [ 0, -1],
    [ W27N ] : [ 0.5, 0.5], [ E27N ] : [ 0.5, -0.5],
    [ W27S ] : [ 0.5, 0.5], [ E27S ] : [ 0.5, -0.5],
};

// 上下方向のレイアウト
const LAYOUT_NONE = 0;
const LAYOUT_SINGLE = 1;
const LAYOUT_NORTH = 8;
const LAYOUT_CENTER = 5;
const LAYOUT_SOUTH = 2;


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

    // タイル内の位置( 0:左上, 1:上, 2:左下, 3:下 )
    const halfPos = ( ( ( this._realX % 1 ) === 0 ) ? 1 : 0 ) + ( ( ( this._realY % 1 ) === 0 ) ? 2 : 0 );

    /**
     * 移動先の地形を調べて配置タイプを返す。
     * @param {Number} undulation 調査する高低差
     * @param {Number} d 向き(テンキー対応)
     * @returns {Number} 配置の種類( LAYOUT_NORTH, LAYOUT_CENTER, LAYOUT_SOUTH, LAYOUT_SINGLE, LAYOUT_NONE )
     */
    const getTileLayout = ( undulation, d )=>{
        const dx = (d - 1) % 3 -1;
        const dy = 1 - Math.floor( ( d - 1 ) / 3 );
        if( undulation !== getUndulation( intX + dx, intY + dy ) ) return LAYOUT_NONE;
        if( isSamePitch( undulation, getUndulation( intX + dx, intY + dy - 1 ) ) ){
            return isSamePitch( undulation, getUndulation( intX + dx, intY + dy + 1 ) ) ? LAYOUT_CENTER : LAYOUT_SOUTH;
        }else{
            return isSamePitch( undulation, getUndulation( intX + dx, intY + dy + 1 ) ) ? LAYOUT_NORTH : LAYOUT_SINGLE;
        }
    };

    const isTileLayoutNorth = ( undulation, d )=>{
        const layout = getTileLayout( undulation, d );
        return layout === LAYOUT_NORTH || layout === LAYOUT_SINGLE;
    }
    const isTileLayoutSouth = ( undulation, d )=>{
        const layout = getTileLayout( undulation, d );
        return layout === LAYOUT_SOUTH || layout === LAYOUT_SINGLE;
    }



    // ＼ W27S
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( W27S, 4 ) || isTileLayoutSouth( W27S, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W27S, 2 ) ||  isTileLayoutSouth( W27S, 4 ) || getTileLayout( W27S, 1 ) === LAYOUT_SINGLE ) return false;
            if( isTileLayoutSouth( W27S, 2 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( W27S, 2 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 1 ){
            if( getTileLayout( W27S, 4 ) === LAYOUT_SINGLE ) return false;
        }else if( halfPos === 3 ){
            if( getTileLayout( W27S, 4 ) === LAYOUT_NORTH ) return false;
        }
    }else if( d === 6 ){
        if( halfPos === 1 ){
            if( getTileLayout( W27S, 6 ) === LAYOUT_NORTH ) return false;
            if( isTileLayoutSouth( W27S, 6 ) ) return true;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( W27S, 7 ) || getTileLayout( W27S, 5 ) === LAYOUT_SINGLE ) return false;
            if( isTileLayoutSouth( W27S, 4 ) ) return true;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( W27S, 8 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W27S, 5 ) || getTileLayout( W27S, 4 ) === LAYOUT_SINGLE ) return false;
        }
    }

    // ＼ W27N
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouth( W27N, 4 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W27N, 1 ) || isTileLayoutNorth( W27N, 2 ) || isTileLayoutSouth( W27N, 2 ) ) return false;
            if( isTileLayoutSouth( W27N, 1 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( W27N, 2 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorth( W27N, 4 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouth( W27N, 4 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( W27N, 5 ) || isTileLayoutSouth( W27N, 7 ) ) return false;
            if( isTileLayoutSouth( W27N, 4 ) ) return true;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( W27N, 8 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( W27N, 4 ) ) return false;
        }
    }


    // ／ E27S
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouth( E27S, 4 ) || isTileLayoutNorth( E27S, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E27S, 1 ) || getTileLayout( E27S, 2 ) === LAYOUT_SINGLE ) return false;
            if( isTileLayoutSouth( E27S, 1 ) ) return true;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( E27S, 2 ) ) return false;
        }
    }else if( d === 4 ){
        if( halfPos === 1 ){
            if( getTileLayout( E27S, 4 ) === LAYOUT_NORTH ) return false;
            if( isTileLayoutSouth( E27S, 4 ) ) return true;
        }
    }else if( d === 6 ){
        if( halfPos === 1 ){
            if( getTileLayout( E27S, 6 ) === LAYOUT_SINGLE ) return false;
        }else if( halfPos === 3 ){
            if( getTileLayout( E27S, 6 ) === LAYOUT_NORTH ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( E27S, 8 ) || getTileLayout( E27S, 4 ) === LAYOUT_SINGLE ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E27S, 4 ) || getTileLayout( E27S, 5 ) === LAYOUT_SINGLE ) return false;
        }
    }

    // ／ E27N
    if( d === 2 ){
        if( halfPos === 0 ){
            if( isTileLayoutSouth( E27N, 5 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E27N, 1 ) || isTileLayoutNorth( E27N, 2 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutNorth( E27N, 2 ) ) return false;
        }
    }else if( d === 6 ){
        if( halfPos === 1 ){
            if( isTileLayoutNorth( E27N, 6 ) ) return false;
        }else if( halfPos === 3 ){
            if( isTileLayoutSouth( E27N, 6 ) ) return false;
        }
    }else if( d === 8 ){
        if( halfPos === 0 ){
            if( isTileLayoutNorth( E27N, 4 ) || isTileLayoutSouth( E27N, 8 ) ) return false;
            if( isTileLayoutSouth( E27N, 5 ) ) return true;
        }else if( halfPos === 1 ){
            if( isTileLayoutSouth( E27N, 8 ) ) return false;
        }else if( halfPos === 2 ){
            if( isTileLayoutNorth( E27N, 5 ) ) return false;
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
            if( isTileLayoutNorth( W63, 5 ) || isTileLayoutSouth( W63, 8 ) ) return false;
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

    return _Game_CharacterBase_isMapPassable.apply( this, arguments );
}

/**
 * 移動から停止・停止から移動に切り替わったタイミングを調べる。
 */
const _Game_CharacterBase_updateMove = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
    if( this instanceof  Game_Follower ) {
         // followerをスムースに動かすための処理を入れる。
    }

    const preRealX = this._realX;
    const tileX = ( preRealX + 0.5 ) % 1;
    const isW =  this.x < preRealX;
    if( this._realX != this.x ){ //移動中
        const undulation = getUndulation( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulation === 0 || undulation & MASK_UNDULATION ){
            const ratioXY = isW ? FLAG2RATIO_W[ undulation ] : FLAG2RATIO_E[ undulation ];
            if( ratioXY && !( ( undulation === W63 && 0.5 < tileX ) || ( undulation === E63 && tileX < 0.5 ) ) ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }

    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x || this._realX === this.x ) return;
 
    const undulation = getUndulation( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulation === -1  || undulation & MASK_BUMP || ( preRealX * 2 ) !== Math.floor( preRealX * 2 ) ) return;

    const targetPos = isW ? FLAG2POS_W[ undulation ] : FLAG2POS_E[ undulation ];
    if( targetPos === undefined ) return;

    // 角度63の坂は半分だけ動かす
    if( undulation === W63 ){
        if( isW ){
            if( tileX === 0 ) return;
        } else {
            if( tileX === 0.5 ) return;
        }
    }else if( undulation === E63 ){
        if( isW ){
            if( tileX === 0.5 ) return;
        } else {
            if( tileX === 0 ) return;
        }
    }

    //動き始め
    this._x = $gameMap.roundX( this._x + targetPos[ 0 ] );
    this._y = $gameMap.roundY( this._y + targetPos[ 1 ] );
    this._realY = this._y - targetPos[ 1 ];
}


 // フラグから段差の量を得るテーブル
 const FLAG2BUMP= { [ BUMP1 ] : 1, [ BUMP2 ] : 2, [ BUMP3 ] : 3 };
 /**
  * 段差指定フラグに応じた段差を返す
  * @param {Number} undulation 段差指定フラグ
  * @returns {Number} 段差(ピクセル)
  */
 function getBump( undulation ){
    const bump = FLAG2BUMP[ undulation ];
    return bump ? ( bump * _BaseBump ) : 0;
 }

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
    if( undulationL & MASK_BUMP ||  undulationR & MASK_BUMP ){
        const dYL = getBump( undulationL );
        const dYR = getBump( undulationR );
        return shiftY + Math.max( dYL, dYR );
    }
    return shiftY;
}


/*---- Game_Player ----*/
/**
 * 階段の上の場合、4方向移動に固定
 * @param {Number} d 向き(テンキー対応)
 */
var _Game_Player_executeMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function( d ) {
    const tmpD = checkAloundUndulationFlag( this.x, this.y, d );
    if( tmpD === -1 ){
        _Game_Player_executeMove.apply( this, arguments );
    }else{
        this.moveStraight( tmpD );
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

    // 下が同じタイルで繋がっている場合は通行可
    if( FLAG2RATIO_W[ undulation ] && isSamePitch( undulation, getUndulation( x, y + 1 ) ) ) return true;

    return _Game_Map_isPassable.apply( this, arguments );
};

// 地形タグ0設定されていれば処理を無視
const _Game_Map_isLadder = Game_Map.prototype.isLadder;
Game_Map.prototype.isLadder = function(x, y) {
    if( isBump( x, y ) ) return false;
    return _Game_Map_isLadder.apply( this, arguments );
};

const _Game_Map_isDamageFloor = Game_Map.prototype.isDamageFloor;
Game_Map.prototype.isDamageFloor = function(x, y) {
    if( isBump( x, y ) ) return false;
    return _Game_Map_isDamageFloor.apply( this, arguments );
};
/**
 * 段差タイルの範囲内か。
 * @param {Number} x x座標(小数点以下を含むタイル数)
 * @param {Number} y y座標(小数点以下を含むタイル数)
 * @returns {Boolean} 
 */
function isBump( x, y ){
    if( getUndulation( x, y ) !== -1 ) return true;
    const isHalfX = ( x % 1 ) !== 0;
    if( isHalfX && getUndulation( x + 1, y ) !== -1 ) return true;
    const isHalfY = ( y % 1 ) !== 0;
    if( isHalfY && getUndulation( x, y + 1 ) !== -1 ) return true;
    if( isHalfX && isHalfY && getUndulation( x + 1, y + 1 ) !== -1 ) return true;
    return false;
}


/*---- Game_Follower ----*/
/**
 * ひとつ前のキャラを追いかける
 * @param {Game_Character} character 追いかけるキャラ
 */
const _Game_Follower_chaseCharacter = Game_Follower.prototype.chaseCharacter;
Game_Follower.prototype.chaseCharacter = function( character ){
    const d = Math.sign( this.deltaYFrom( character.y ) ) * 3 - Math.sign( this.deltaXFrom( character.x ) ) + 5;
    const tmpD = checkAloundUndulationFlag( this.x, this.y, d );
    if( tmpD === -1 ){
        _Game_Follower_chaseCharacter.apply( this, arguments );
    }else{
        this.moveStraight( tmpD );
    }
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
        if( ( flag  >> 12 ) === _TerrainTag ){
            const bump = ( flag  & MASK_BUMP );
            if( bump ) return bump;
            return flag & MASK_UNDULATION;
        }
    }
    return -1;
}

/**
 * 高低差flagのあるタイル周辺か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Number} 高低差flagのあるタイル周辺だと向き、そうでないと-1を返す
 */
function checkAloundUndulationFlag( x, y, d ){
    const tmpD = [ 0, 4, 2, 6, 4, 5, 6, 4, 8, 6 ][ d ];
    const targetX =  ( tmpD === 6 ) ? $gameMap.roundX( x + 0.5 ) : x ;

    if(   FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( y - 1 ) ) ]
        || FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( y ) ) ]
        || FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( y + 1 ) ) ]
    ){
        return tmpD
    }else{
        return -1;
    }
}

/**
 * 27°の高低差タイプを角度基準で正規化して返す
 * @param {Nubmer} undulation 高低差タイプ
 */
function normalizByPitch( undulation ){
    if( undulation === W27S ) return W27N;
    if( undulation === E27S ) return E27N;
    return undulation;
}

/**
 * 指定したふたつの高低差タイプが同じ角度であるか比較
 * @param {Nubmer} undulationA 高低差タイプ
 * @param {Nubmer} undulationB 高低差タイプ
 * @returns {Boolean} 同じ角度か
 */
function isSamePitch( undulationA, undulationB ){
    return normalizByPitch( undulationA ) === normalizByPitch( undulationB );
};

})();
