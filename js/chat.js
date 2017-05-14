$(function () {
    "use strict";

    // usuario atual
    var currentUsername;

    // elementos da página
    var content = $('#app-conteudo');
    var flag = true;
    var listUsers;
    var messagesBox;
    var inMessage;
    var btSendMsg;
    var connection;

    // lista de usuários ativos
    var usersList = [];

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // se o WebSocket não foi criado, não será possível usar a aplicação
    if (!window.WebSocket) {
        //TODO: implementar
        return;
    }

    try {
        connection = new WebSocket('ws://192.168.150.24:8181');
        loadFragment('login.html', loginController);
        startMonitorConnection();
    } catch (error) {
        //TODO: implementar 
        console.log(error);
    }

    function sendMessage(type, message) {
        connection.send(JSON.stringify({ type: type, message: message }));
    }

    function loadFragment(page, callback) {
        var path = 'fragments/' + page;
        content.load(path, callback);
    }

    /**
     * Monitora a conexão com o servidor, verificando se ela ainda está ativa a cada 1 segundo
     */
    function startMonitorConnection() {

        setInterval(function () {

            if (connection.readyState !== 1) {
                // CONEXAO INATIVA
            }

        }, 1000);
    }

    /**
     * Controlador da página de login
     * @param {*} response 
     * @param {*} status 
     */
    function loginController(response, status) {

        var btSendLogin = $('#bt-send-login');
        var inUsername = $('#username');

        btSendLogin.on('click', function (e) {
            sendMessage('login', inUsername.val());
            btSendLogin.attr('disabled', 'disabled');
            inUsername.attr('disabled', 'disabled');
        });

        connection.onmessage = function (message) {

            try {
                var serverMessage = JSON.parse(message.data);
            } catch (e) {
                console.log('Não foi possível transformar a mensagem em um objeto JSON: ' + e);
                return;
            }

            // retorno do login
            if (serverMessage.type === 'retLogin') {
                var status = serverMessage.text;

                // se login foi realizado carrega a pagina de chat
                if (status === '001') {
                    currentUsername = inUsername.val();
                    loadFragment('chat.html', chatController);
                } else if (status === '002') {
                    inUsername.removeAttr('disabled');
                    btSendLogin.removeAttr('disabled');
                    $('.js-box-username').addClass('has-warning');
                    $('.js-login-error').fadeIn('fast');
                }

            }
        }

    }

    /**
     * Controlador da página de chat
     * @param {*} response 
     * @param {*} status 
     */
    function chatController(response, status) {

        listUsers = $('.box-online-users');
        messagesBox = $('.chat-messages');
        inMessage = $('#in-message');
        btSendMsg = $('#btn-send-message');

        initialize();

        // evento disparado ao clicar no botão 
        btSendMsg.on('click', function (e) {
            sendMessage('message', inMessage.val());
            btSendMsg.attr('disabled', 'disabled');
            inMessage.val('');
        });

        inMessage.on('keyup', function (e) {

            var msg = inMessage.val();

            if (msg.length > 0) {
                btSendMsg.removeAttr('disabled');
                inMessage.parent().addClass('has-success');
            } else {
                btSendMsg.attr('disabled', 'disabled');
                inMessage.parent().removeClass('has-success');
            }

        });

        // evento disparado ao pressionar alguma tecla no input
        inMessage.on('keydown', function (e) {

            // tecla 'enter'
            if (e.keyCode === 13) {

                var msg = inMessage.val();

                if (!msg) {
                    return;
                }

                // envia mensagem ao servidor
                sendMessage('message', msg);

                // limpa campo de mensagem a ser enviada
                inMessage.empty();
            }

        });

        // evento é disparado ao abrir conexão
        connection.onopen = function () {
            // inUsername.removeAttr('disabled');
            // btnLogin.removeAttr('disabled');
        };

        // evento é disparado caso ocorra um erro
        connection.onerror = function () {
            //TODO: implementar
        }

        // evento é disparado ao receber uma mensagem do servidor
        connection.onmessage = function (message) {

            try {
                var serverMessage = JSON.parse(message.data);
            } catch (e) {
                console.log('Não foi possível transformar a mensagem em um objeto JSON: ' + e);
                return;
            }

            // processa as mensagens retornados do servidor
            if (serverMessage.type === 'message') {
                addMessage(serverMessage.author, serverMessage.text);
            } else if (serverMessage.type === 'newUserConnected') {
                var user = serverMessage.data;
                addUser(user.id, user.user);
                notificationUserLogin(user);
            }

            flag = !flag;
        }

        /**
         * Limpa os elementos da tela
         */
        function initialize() {
            $('.js-current-user').text(currentUsername);
            messagesBox.empty();
            listUsers.empty();
            inMessage.removeAttr('disabled');

        }

        function addMessage(author, message) {

            var messageBox = '<div class="bubble :aligment">';
            messageBox += '<div class="talk-bubble tri-right text-left :corner-alignment">';
            messageBox += '<div style="min-width: 150px;">';
            messageBox += '<span class="subject-message text-left">' + author + ':</span>';
            messageBox += '<span class="message-received-date text-right">' + formatTime(new Date()) + '</span>';
            messageBox += '</div>';
            messageBox += '<div class="talktext">';
            messageBox += '<p>' + message + '</p>';
            messageBox += '</div>';
            messageBox += '</div>';
            messageBox += '</div>';

            if (author !== currentUsername) {
                messageBox = messageBox.replace(':aligment', 'text-left').replace(':corner-alignment', 'left-top');
            } else {
                messageBox = messageBox.replace(':aligment', 'text-right').replace(':corner-alignment', 'right-top');
            }

            messagesBox.prepend(messageBox);
        }

        function addUser(id, user) {

            // adiciona novo usuário conectado a lista
            usersList.push();

            var item = '<button id=":id" type="button" class="user list-group-item"><i class="fa fa-circle fa-lg icon-pad-user-status" aria-hidden="true"></i> :user</button>';
            listUsers.prepend(item.replace(':id', id).replace(':user', user));
        }

        function notificationUserLogin(user) {

            var welcomeMessage = ' acabou de entrar';

            var notification = '<div id="new-user-' + user.id + '" class="bubble text-center">';
            notification += '<div class="talk-bubble tri-right text-center">';
            notification += '<div class="talktext new-user">';
            notification += '<strong>' + user.user + '</strong> ' + welcomeMessage;
            notification += '</div>';
            notification += '</div>';
            notification += '</div>';

            messagesBox.prepend(notification);
        }

    }

});
