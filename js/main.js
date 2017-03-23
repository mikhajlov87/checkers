(function () {
    'use strict';

    var chessboard;

    function Chessboard() {
        this.size = {
            width: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
            height: ['1', '2', '3', '4', '5', '6', '7', '8']
        };

        this.checkers = {
            white: ['b1', 'd1', 'f1', 'h1'],
            black: ['a8', 'c8', 'e8', 'g8']
        };
    }

    Chessboard.prototype.gameOver = function (color) {
        var nextMoveBtn = document.querySelector('.btn-move');

        nextMoveBtn.removeEventListener('click', eventHandlers.toggle);
        nextMoveBtn.removeEventListener('click', eventHandlers.nextMove);

        alert('GAME OVER\n winner is\n ' + color.toUpperCase());
    };

    function Checker(color, id) {
        this.color = color;
        this.name = id;
    }

    Checker.prototype.isGameOver = function (id) {
        switch (this.color) {
            case 'white':
                var vin = ['a8', 'c8', 'e8', 'g8'];
                break;

            case 'black':
                vin = ['b1', 'd1', 'f1', 'h1'];
                break;
        }

        for (var i = 0; i < vin.length; i++) {
            if (id === vin[i]) {
                chessboard.gameOver(this.color);
            }
        }
    };

    Checker.prototype.getField = function (id) {
        return document.querySelector('#' + id);
    };

    Checker.prototype.findPossibleMove = function () {
        var firstLetter = this.name[0];
        var secondLetter = this.name[1];
        var horizontal = chessboard.size.width;
        var vertical = chessboard.size.height;
        var result = '';
        var firstIndex = actions.findIndex(horizontal, firstLetter);
        var secondIndex = actions.findIndex(vertical, secondLetter);

        switch (this.color) {
            case 'white':
                if (horizontal[firstIndex - 1] && vertical[secondIndex + 1]) {
                    result += horizontal[firstIndex - 1] + vertical[secondIndex + 1];
                    this.possibleMove.push(result);
                    result = '';
                }

                if (horizontal[firstIndex + 1] && vertical[secondIndex + 1]) {
                    result += horizontal[firstIndex + 1] + vertical[secondIndex + 1];
                    this.possibleMove.push(result);
                }
                break;

            case 'black':
                if (horizontal[firstIndex - 1] && vertical[secondIndex - 1]) {
                    result += horizontal[firstIndex - 1] + vertical[secondIndex - 1];
                    this.possibleMove.push(result);
                    result = '';
                }

                if (horizontal[firstIndex + 1] && vertical[secondIndex - 1]) {
                    result += horizontal[firstIndex + 1] + vertical[secondIndex - 1];
                    this.possibleMove.push(result);
                }
                break;
        }
    };

    Checker.prototype.isCanMove = function () {
        var possibleMove = this.possibleMove;
        var len = possibleMove.length;
        var ONE = 1;
        var field;
        var i;
        if (!!len) {
            for (i = 0; i < len; i++) {
                field = this.getField(possibleMove[i]);
                if ( this.isEmptyField(field) ) {
                    this.canMove = true;
                } else {
                    if ( this.isOurChecker(field) ) {
                        this.possibleMove.splice(i, ONE);
                        this.isCanMove();
                        break;
                    } else {
                        this.isCanStrike(field.id);
                        if (!this.canStrike) {
                            this.possibleMove.splice(i, ONE);
                            this.isCanMove();
                            break;
                        }
                    }
                }
            }

        } else {
            this.canMove = false;
        }
    };

    Checker.prototype.isEmptyField = function (field) {
        return !field.hasChildNodes();
    };

    Checker.prototype.isOurChecker = function (field) {
        var checker = field.firstElementChild;

        return checker.classList.contains(this.color);
    };

    Checker.prototype.findPossibleStrikeField = function (id) {
        var ID_LENGTH = 2;
        var horizontal = chessboard.size.width;
        var vertical = chessboard.size.height;
        var result = '';
        var arr;
        var i;

        for (i = 0; i < id.length; i++) {
            arr = horizontal;

            if (i) {
                arr = vertical;
            }

            var myIndex = actions.findIndex(arr, this.name[i]);
            var enemyIndex = actions.findIndex(arr, id[i]);

            if (myIndex > enemyIndex) {
                result += (enemyIndex - 1);
            } else {
                result += (enemyIndex + 1);
            }
        }

        var FIRST_INDEX = 0;
        var LAST_INDEX = 1;

        var finallyResult = '' + horizontal[result[FIRST_INDEX]] + vertical[result[LAST_INDEX]];

        if (finallyResult.length === ID_LENGTH) {
            return finallyResult;
        } else {
            return false;
        }
    };

    Checker.prototype.isCanStrike = function (id) {
        var possibleFieldId = this.findPossibleStrikeField(id);
        var possibleField = this.getField(possibleFieldId);

        if (possibleFieldId) {
            if ( this.isEmptyField(possibleField) ) {
                this.canStrike = true;
                this.enemyField = id;
                this.possibleStrikeField = possibleField;
            } else {
                this.canStrike = false;
            }
        } else {
            this.canStrike = false;
        }

    };

    Checker.prototype.doStrike = function () {
        var ONE_ELEMENT = 1;
        var FIRST_ELEMENT = 0;
        var field = this.getField(this.name);
        var checker = field.firstElementChild;
        var enemyField = this.getField(this.enemyField);
        var enemy = enemyField.firstElementChild;
        var replaceChecker = field.removeChild(checker);

        this.possibleStrikeField.appendChild(replaceChecker);
        this.name = this.possibleStrikeField.id;
        delete this.possibleStrikeField;

        var replaceEnemyChecker = enemyField.removeChild(enemy);
        var checkers;
        var remove;
        var side;
        var i;

        switch (this.color) {
            case 'white':
                side = 'left';
                checkers = chessboard.checkers.black;
                break;

            case 'black':
                side = 'right';
                checkers = chessboard.checkers.white;
                break;
        }

        var storage = document.querySelector('.storage.' + side);

        replaceEnemyChecker.classList.add('beaten');

        for (i = 0; i < checkers.length; i++) {
            if (checkers[i].name === this.enemyField) {
                remove = checkers.splice(i, ONE_ELEMENT);
                break;
            }
        }

        remove[FIRST_ELEMENT] = null;

        storage.appendChild(replaceEnemyChecker);
        this.isGameOver(this.name);
    };

    Checker.prototype.doMove = function () {
        var possibleMove = this.possibleMove;
        var min = 0;
        var max = possibleMove.length - 1;

        if (max < 0) {
            max = 0;
        }

        var index = actions.randomMove(min, max);
        var field = this.getField(this.name);
        var fieldToMove = this.getField(possibleMove[index]);
        var checker = field.removeChild(field.firstElementChild);

        fieldToMove.appendChild(checker);
        this.name = possibleMove[index];
        this.isGameOver(this.name);
    };

    var actions = {
        insertElem: function (elem) {
            var lastElement = document.body.lastElementChild;
            document.body.insertBefore(elem, lastElement);
        },

        createChessboard: function () {
            var div = this.createElem('div');
            var chessboard;

            div.className = 'chessboard';
            chessboard = this.createChessboardFields(div);
            this.insertElem(chessboard);
        },

        createElem: function (elem) {
            return document.createElement(elem);
        },

        createChessboardFields: function (board) {
            var width = chessboard.size.width.length;
            var height = chessboard.size.height.length;
            var len = width * height;
            var evenNumber;
            var evenRow;
            var field;
            var nextRow;
            var row = 8;
            var id;
            var i;
            var j = 0;

            for (i = 1; i <= len; i++) {
                field = this.createElem('div');
                field.className = 'field';

                evenNumber = i % 2;
                evenRow = row % 2;
                nextRow = i % width;
                id = '' + chessboard.size.width[j] + chessboard.size.height[row - 1];
                j++;

                if (!evenRow) {
                    if (!evenNumber) {
                        field.classList.add('black');
                    } else {
                        field.classList.add('white');
                        field.id = id;
                    }
                } else {
                    if (!evenNumber) {
                        field.classList.add('white');
                        field.id = id;
                    } else {
                        field.classList.add('black');
                    }
                }

                if (!nextRow) {
                    row--;
                    j = 0;
                }

                board.appendChild(field);
            }

            return board;
        },

        createStorage: function (className) {
            var storage = this.createElem('div');

            storage.className = 'storage ' + className;
            this.insertElem(storage);
        },

        createNextMoveBtn: function () {
            var nextMoveBtn = this.createElem('button');
            var storageLeft = document.querySelector('.storage.left');

            nextMoveBtn.className = 'btn-move black-move';
            nextMoveBtn.innerHTML = 'next move';

            nextMoveBtn.addEventListener('click', eventHandlers.toggle);
            nextMoveBtn.addEventListener('click', eventHandlers.nextMove);

            storageLeft.appendChild(nextMoveBtn);
        },

        createEndGameBtn: function () {
            var endMoveBtn = this.createElem('button');
            var storageRight = document.querySelector('.storage.right');

            endMoveBtn.className = 'btn-move';
            endMoveBtn.innerHTML = 'end game';
            storageRight.appendChild(endMoveBtn);
        },

        createCheckers: function () {
            var storageLeft = document.querySelector('.storage.left');
            var storageRight = document.querySelector('.storage.right');
            var len = chessboard.checkers.white.length;
            var white = chessboard.checkers.white;
            var black = chessboard.checkers.black;
            var checker;
            var i;

            for (i = 0; i < len; i++) {
                white[i] = new Checker('white', white[i]);
                black[i] = new Checker('black', black[i]);
                checker = this.createElem('div');
                checker.className = 'checker white beaten';
                storageLeft.appendChild(checker);

                checker = this.createElem('div');
                checker.className = 'checker black beaten';
                storageRight.appendChild(checker);
            }
        },

        createMainButton: function () {
            var mainBtn = this.createElem('a');

            mainBtn.className = 'main-button active';
            mainBtn.id = 'main-button';
            mainBtn.href = '';
            mainBtn.innerHTML = 'start game';

            mainBtn.addEventListener('click', eventHandlers.startGame);
            this.insertElem(mainBtn);
        },

        locateCheckersToStartPosition: function () {
            var checkers = document.querySelectorAll('.checker');
            var field;
            var checker;
            var indexWhite = 0;
            var indexBlack = 0;
            var id;
            var i;

            for (i = 0; i < checkers.length; i++) {

                checker = checkers[i].parentNode.removeChild(checkers[i]);
                checker.classList.remove('beaten');
                checker.style.cssText = '';

                if ( checker.classList.contains('white') ) {
                    id = chessboard.checkers.white[indexWhite].name;
                    indexWhite++;

                } else if ( checker.classList.contains('black') ) {
                    id = chessboard.checkers.black[indexBlack].name;
                    indexBlack++;
                }

                field = this.getCheckerField(id);
                field.appendChild(checker);
            }
        },

        getCheckerField: function (id) {
            return document.querySelector('#' + id);
        },

        findIndex: function(arr, value) {
            if ([].indexOf) {
                return arr.indexOf(value);
            } else {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === value) {
                        return i;
                    }
                }
                return -1;
            }
        },

        randomMove: function (min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1);

            rand = Math.round(rand);
            return Math.abs(rand);
        }

    };

    var eventHandlers = {
        load: function () {
            chessboard = new Chessboard();
            actions.createChessboard();
            actions.createStorage('left');
            actions.createStorage('right');
            actions.createNextMoveBtn();
            actions.createEndGameBtn();
            actions.createCheckers();
            actions.createMainButton();
        },

        resize: function () {
            var board = document.querySelector('.chessboard');
            var boardComputedStyle = getComputedStyle(board);
            var even = parseInt(boardComputedStyle.height) / 2;
            var floor = Math.floor(even);

            board.style.cssText = 'width: ' + floor * 2 + 'px;';

            var checkers = document.querySelectorAll('.checker.beaten');
            var checkersComputedStyle;

            for (var i = 0; i < checkers.length; i++) {
                checkersComputedStyle = getComputedStyle(checkers[i]);
                checkers[i].style.cssText = 'width: ' + checkersComputedStyle.height + ';';
            }
        },

        startGame: function (event) {
            var mainBtn = document.querySelector('#main-button');

            mainBtn.classList.remove('active');
            mainBtn.removeEventListener('click', this.startGame);
            actions.locateCheckersToStartPosition();
            event.preventDefault();
        },

        toggle: function () {
            var btn = document.querySelector('.btn-move');

            btn.classList.toggle('white-move');
            btn.classList.toggle('black-move');
        },

        nextMove: function () {
            var btn = document.querySelector('.btn-move');
            var checkersCanMoves = [];
            var checkersCanStrike = [];
            var checkers;
            var color;
            var i;

            if ( btn.classList.contains('white-move') ) {
                checkers = chessboard.checkers.white;

            } else if ( btn.classList.contains('black-move') ) {
                checkers = chessboard.checkers.black;
            }

            if (!checkers.length) {
                if ( btn.classList.contains('white-move') ) {
                    color = 'black';
                } else {
                    color = 'white';
                }
                chessboard.gameOver(color);
            }

            for (i = 0; i < checkers.length; i++) {
                checkers[i].canMove = false;
                checkers[i].canStrike = false;
                checkers[i].possibleMove = [];
                checkers[i].possibleStrikeField = [];
                delete checkers[i].enemyField;

                checkers[i].findPossibleMove();
                checkers[i].isCanMove();

                for (var key in checkers[i]) {
                    if (checkers[i].hasOwnProperty(key)) {

                        if (key === 'canMove' && checkers[i][key]) {
                            checkersCanMoves.push(checkers[i]);
                        }

                        if (key === 'canStrike' && checkers[i][key]) {
                            checkersCanStrike.push(checkers[i]);
                        }
                    }
                }
            }

            var min = 0;
            var index;
            var max;

            if (checkersCanStrike.length) {
                max = checkersCanStrike.length - 1;
                index = actions.randomMove(min, max);

                checkersCanStrike[index].doStrike(checkersCanStrike[index].possibleStrikeField);

            } else if (checkersCanMoves.length) {
                max = checkersCanMoves.length - 1;
                index = actions.randomMove(min, max);
                checkersCanMoves[index].doMove();
            } else {
                chessboard.gameOver();
            }
        }
    };

    window.addEventListener('DOMContentLoaded', eventHandlers.load);
    window.addEventListener('DOMContentLoaded', eventHandlers.resize);
    window.addEventListener('resize', eventHandlers.resize);

})();